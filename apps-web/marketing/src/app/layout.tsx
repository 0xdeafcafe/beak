import React from 'react';
import { Open_Sans } from 'next/font/google';
import { cookies } from 'next/headers';

import Scroller from '../components/atoms/Scroller';
import ThemeCookieManager from '../components/atoms/ThemeCookieManager';
import AppContainer from '../containers/App';
import { GlobalStyle } from '../design-system';
import StyledComponentsRegistry from '../utils/styled-components-registery';
import { ensureThemeIsValid } from '../utils/theme';

// export const metadata: Metadata = {
// 	title: 'Create Next App',
// 	description: 'Generated by create next app',
// };

const openSans = Open_Sans({
	weight: ['300', '400', '700', '800'],
	subsets: ['latin-ext'],
	display: 'swap',
});

export default function RootLayout(props: React.PropsWithChildren<unknown>) {
	const { children } = props;
	const themeCookie = cookies().get('client_theme');
	const theme = ensureThemeIsValid(themeCookie?.value);

	return (
		<html lang={'en'}>
			<head>
				<meta charSet={'utf-8'} />
				<meta name={'viewport'} content={'width=device-width, initial-scale=1'} />
				<link rel={'shortcut icon'} href={'/assets/favicon.ico'} />
			</head>
			<body className={openSans.className}>
				<StyledComponentsRegistry>
					<base href={'./'} />
					<ThemeCookieManager
						serverKnewTheme={Boolean(themeCookie)}
						serverTheme={theme}
					>
						<GlobalStyle />
						<AppContainer>
							{/* <Sentry.ErrorBoundary fallback={<ErrorFallback />}> */}
							<Scroller />
							{children}
							{/* </Sentry.ErrorBoundary> */}
						</AppContainer>
					</ThemeCookieManager>
				</StyledComponentsRegistry>
			</body>
		</html>
	);
}

// if (import.meta.env.MODE !== 'development') {
// 	Sentry.init({
// 		dsn: 'https://8b49a1bc9c164490bbd0d7e564c92794@o988021.ingest.sentry.io/5948027',
// 		integrations: [new Integrations.BrowserTracing()],
// 		environment: import.meta.env.ENVIRONMENT,
// 		release: import.meta.env.RELEASE_IDENTIFIER,

// 		tracesSampleRate: 1.0,
// 	});
// }