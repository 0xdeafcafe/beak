import {
	AuthenticateUserResponse,
	GetMarketingConsentResponse,
	GetSubscriptionStatusResponse,
	GetUserResponse,
	NewsItem,
} from '@beak/common/types/nest';
import QueryablePromise from '@beak/common/utils/promises';
import Squawk from '@beak/common/utils/squawk';
import crpc, { Client } from '@beak/crpc';
import crypto from 'crypto';
import { getFingerprint } from 'hw-fingerprint';

import AuthClient from './auth-client';
import persistentStore from './persistent-store';

class NestClient {
	private authClient: AuthClient;
	private client: Client;
	private authRefreshPromise?: QueryablePromise<unknown>;

	constructor() {
		const environment = persistentStore.get('environment');
		const environmentPrefix = environment === 'nonprod' ? 'nonprod-' : '';
		const nestUrl = `https://nest.${environmentPrefix}getbeak.app/1/`;

		this.authClient = new AuthClient();
		this.client = crpc(nestUrl, { timeout: 5000 });
	}

	async getAuth(): Promise<AuthenticateUserResponse | null> {
		return await this.authClient.getAuth();
	}

	async setAuth(auth: AuthenticateUserResponse | null) {
		await this.authClient.setAuth(auth);
	}

	async rpc<T>(path: string, body: unknown) {
		const fn = (auth: AuthenticateUserResponse | null) => this.client<T>(path, body, generateOptions(auth));

		try {
			return await fn(await this.getAuth());
		} catch (error) {
			const sqk = Squawk.coerce(error);

			if (sqk.code !== 'unauthorized')
				throw sqk;

			await this.refresh();

			return await fn(await this.getAuth());
		}
	}

	async rpcNoAuth<T>(path: string, body: unknown) {
		return await this.client<T>(path, body);
	}

	async sendMagicLink(email: string) {
		const { codeChallenge, state } = generateMagicState();

		try {
			await this.rpcNoAuth('2020-12-14/send_magic_link', {
				clientId: getClientId(),
				redirectUri: 'https://magic.getbeak.app/',
				state,
				codeChallengeMethod: 'S256',
				codeChallenge,
				identifierType: 'email',
				identifierValue: email,
				device: {
					platform: getPlatform(),
					beakId: persistentStore.get('beakId'),
					fingerprint: (await getFingerprint()).toString('base64url'),
				},
			});
		} catch (error) {
			const squawk = Squawk.coerce(error);
			const message = (squawk.meta?.message ?? '') as string;

			if (['Missing final \'@domain\'', 'Domain starts with dot'].includes(message))
				throw new Squawk('invalid_email', void 0, [squawk]);

			throw squawk;
		}
	}

	async createTrialAndMagicLink(email: string) {
		const { codeChallenge, state } = generateMagicState();

		try {
			await this.rpcNoAuth('2021-10-06/create_trial_and_magic_link', {
				clientId: getClientId(),
				redirectUri: 'https://magic.getbeak.app/',
				state,
				codeChallengeMethod: 'S256',
				codeChallenge,
				identifierType: 'email',
				identifierValue: email,
				device: {
					platform: getPlatform(),
					beakId: persistentStore.get('beakId'),
					fingerprint: (await getFingerprint()).toString('base64url'),
				},
			});
		} catch (error) {
			const squawk = Squawk.coerce(error);
			const message = (squawk.meta?.message ?? '') as string;

			if (['Missing final \'@domain\'', 'Domain starts with dot'].includes(message))
				throw new Squawk('invalid_email', void 0, [squawk]);

			throw squawk;
		}
	}

	async handleMagicLink(code: string, state: string) {
		const magicStates = persistentStore.get('magicStates');
		const magicState = magicStates[state];

		if (!magicState)
			throw new Squawk('invalid_state');

		console.log('a');

		const authentication = await this.rpcNoAuth<AuthenticateUserResponse>('2020-12-14/authenticate_user', {
			clientId: getClientId(),
			grantType: 'authorization_code',
			redirectUri: magicState.redirectUri,
			code,
			codeVerifier: magicState.codeVerifier,
		});

		console.log('b');
		console.log(authentication);

		persistentStore.reset('magicStates');

		await this.setAuth(authentication);
		await this.ensureActiveSubscription();

		console.log('c');

		return authentication;
	}

	async ensureActiveSubscription() {
		const subscription = await this.getSubscriptionStatus();

		if (['active', 'incomplete', 'trialing', 'past_due'].includes(subscription.status))
			return;

		throw new Squawk('subscription_not_active');
	}

	async getSubscriptionStatus() {
		const auth = await this.getAuth();

		if (!auth)
			throw new Squawk('not_authenticated');

		return await this.rpc<GetSubscriptionStatusResponse>('2021-10-06/get_subscription_status', {
			userId: auth.userId,
		});
	}

	async getMarketingConsent() {
		const auth = await this.getAuth();

		if (!auth)
			throw new Squawk('not_authenticated');

		return await this.rpc<GetMarketingConsentResponse>('2020-12-14/get_marketing_consent', {
			userId: auth.userId,
		});
	}

	async setMarketingConsent(level: 'none' | 'general') {
		const auth = await this.getAuth();

		if (!auth)
			throw new Squawk('not_authenticated');

		return await this.rpc('2020-12-14/set_marketing_consent', {
			userId: auth.userId,
			level,
		});
	}

	async getUser() {
		const auth = await this.getAuth();

		if (!auth)
			throw new Squawk('not_authenticated');

		return await this.rpc<GetUserResponse>('2021-10-06/get_user', {
			userId: auth.userId,
		});
	}

	private async refresh() {
		// Check promise exists and that is hasn't been fulfilled
		if (this.authRefreshPromise && this.authRefreshPromise.status === 'pending')
			return await this.authRefreshPromise;

		const promise = new QueryablePromise<void>((_resolve, reject) => {
			this.authenticate('refresh_token').catch(reject);
		});

		return await (this.authRefreshPromise = promise);
	}

	private async authenticate(grantType: 'refresh_token') {
		const auth = (await this.getAuth()) ?? { clientId: '', refreshToken: '' };

		const payload = {
			clientId: auth.clientId,
			grantType,
			refreshToken: auth.refreshToken,
		};

		const response = await this.rpcNoAuth<AuthenticateUserResponse>(
			'2020-12-14/authenticate_user',
			payload,
		);

		await this.setAuth(response);
	}

	async listNewsItems(clientId?: string) {
		return await this.rpc<NewsItem[]>('2020-12-14/list_news_items', {
			clientId: clientId ?? getClientId(),
		});
	}
}

function getPlatform() {
	switch (process.platform) {
		case 'darwin':
			return 'mac';

		case 'win32':
		default:
			return 'windows';
	}
}

function getClientId() {
	switch (getPlatform()) {
		case 'mac':
			return 'client_000000C2kdCzNlbL1BqR5FeMatItU';

		case 'windows':
		default:
			return 'client_000000CAixkP7YVb0cH1zvNfE5mYi';
	}
}

function generateMagicState(redirectUri = 'https://magic.getbeak.app/') {
	const randomState = crypto.randomBytes(32);
	const randomVerifier = crypto.randomBytes(32);

	const state = convertToWebSafe(randomState.toString('base64'));
	const codeVerifier = convertToWebSafe(randomVerifier.toString('base64'));

	// Hash the code verifier, then make it web-safe base64
	const codeChallengeHash = crypto.createHash('sha256')
		.update(codeVerifier, 'ascii')
		.digest('base64');

	const codeChallenge = convertToWebSafe(codeChallengeHash);

	// Create, insert, and store magic states to local storage
	persistentStore.set('magicStates', {
		...persistentStore.get('magicStates'),
		[state]: {
			state,
			codeVerifier,
			codeChallenge,
			redirectUri,
		},
	});

	return { codeChallenge, state };
}

function generateOptions(auth: AuthenticateUserResponse | null) {
	if (!auth)
		return void 0;

	return { headers: { authorization: `bearer ${auth.accessToken}` } };
}

function convertToWebSafe(str: string) {
	return str
		.replace(/[+]/g, '-')
		.replace(/[/]/g, '_')
		.replace(/[=]+$/, '');
}

const nestClient = new NestClient();

export default nestClient;
