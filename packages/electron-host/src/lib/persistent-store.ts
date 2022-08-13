import { ArbiterStatus } from '@beak/common/types/arbiter';
import { RecentLocalProject } from '@beak/common/types/beak-hub';
import { MagicStates } from '@beak/common/types/nest';
import { ThemeMode } from '@beak/common/types/theme';
import crypto from 'crypto';
import { app } from 'electron';
import ElectronStore from 'electron-store';

import { WindowState } from './window-state-manager';

export type Environment = 'prod' | 'nonprod';

export type WindowPresence = GenericWindowPresence | ProjectMainWindowPresence;

export interface GenericWindowPresence {
	type: 'generic';
	payload: 'welcome' | 'preferences' | 'portal';
}

export interface ProjectMainWindowPresence {
	type: 'project-main';
	payload: string;
}

export interface Store {
	recents: RecentLocalProject[];
	windowStates: Record<string, WindowState>;
	previousWindowPresence: WindowPresence[];
	beakId: string;

	latestKnownVersion: string | null;
	environment: Environment;
	arbiter: ArbiterStatus;
	magicStates: MagicStates;
	referenceFiles: Record<string, Record<string, string>>;

	passedOnboarding: boolean;
	projectMappings: Record<string, string>;

	themeMode: ThemeMode;
}

const persistentStore = new ElectronStore<Store>({
	defaults: {
		recents: [],
		windowStates: {},
		previousWindowPresence: [],
		beakId: crypto.randomBytes(128).toString('base64url'),

		latestKnownVersion: app.getVersion(),
		environment: 'prod',
		arbiter: {
			lastSuccessfulCheck: '1989-12-13T00:00:00Z',
			lastCheckError: null,
			lastCheck: new Date().toISOString(),
			status: false,
		},
		magicStates: {},
		referenceFiles: {},

		passedOnboarding: false,
		projectMappings: {},

		themeMode: 'system',
	},
});

export default persistentStore;
