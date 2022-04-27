import { app, BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import * as path from 'path';
import * as url from 'url';

import { closeWatchersOnWindow } from './ipc-layer/fs-watcher-service';
import WindowStateManager from './lib/window-state-manager';
import { staticPath } from './utils/static-path';

export type Container = 'project-main' | 'welcome' | 'preferences' | 'portal';

export const windowStack: Record<number, BrowserWindow> = {};
export const windowType: Record<number, Container> = {};
export const stackMap: Record<string, number> = { };

const DEV_URL = 'http://localhost:3000';
// eslint-disable-next-line no-process-env
const environment = process.env.NODE_ENV;

function generateLoadUrl(
	container: Container,
	windowId: number,
	additionalParams?: Record<string, string>,
) {
	let loadUrl = new URL(url.format({
		pathname: path.join(staticPath, 'index.html'),
		protocol: 'file:',
		slashes: true,
	}));

	if (environment !== 'production')
		loadUrl = new URL(DEV_URL);

	if (additionalParams) {
		Object.keys(additionalParams).forEach(k => {
			if (k === 'container')
				return; // Just to be extra safe

			const urlSafe = encodeURIComponent(additionalParams[k]);

			loadUrl.searchParams.set(k, urlSafe);
		});
	}

	loadUrl.searchParams.set('container', container);
	loadUrl.searchParams.set('version', app.getVersion());
	loadUrl.searchParams.set('platform', process.platform);
	loadUrl.searchParams.set('windowId', String(windowId));

	return loadUrl.toString();
}

function createWindow(
	windowOpts: BrowserWindowConstructorOptions,
	container: Container,
	additionalParams?: Record<string, string>,
) {
	const windowStateManager = new WindowStateManager(container, windowOpts);
	const window = new BrowserWindow({
		webPreferences: {
			contextIsolation: true,
			preload: path.join(app.getAppPath(), 'preload.js'),
		},
		show: false,
		...windowOpts,
	});

	windowStateManager.attach(window);

	window.loadURL(generateLoadUrl(container, window.id, additionalParams));
	window.on('ready-to-show', () => {
		window.show();
		window.focus();
	});
	window.on('close', () => {
		delete windowStack[window.id];
	});

	window.webContents.on('did-start-loading', () => {
		// When a window loads, make sure any watchers from the previous session are closed
		// This only really affects things like FS watchers, which can persist after a reload
		closeWatchersOnWindow(window.webContents.id);
	});

	windowStack[window.id] = window;
	windowType[window.id] = container;

	return window;
}

export function tryCloseWelcomeWindow() {
	const windowId = stackMap.welcome;

	if (windowId === void 0)
		return;

	const window = windowStack[windowId];

	if (!window)
		return;

	window.close();

	delete windowStack[windowId];
	delete stackMap.welcome;
}

export function closeWindow(windowId: number) {
	const window = windowStack[windowId];

	if (!window)
		return; // probs already closed...

	window.close();
	delete windowStack[windowId];
}

export function createWelcomeWindow() {
	const existing = stackMap.welcome;

	if (existing && windowStack[existing]) {
		if (windowStack[existing].isMinimized())
			windowStack[existing].restore();

		windowStack[existing].focus();

		return existing;
	}

	const windowOpts: BrowserWindowConstructorOptions = {
		height: 500,
		width: 900,
		resizable: false,
		title: 'Welcome to Beak!',
		autoHideMenuBar: true,
		transparent: true,
		visualEffectState: 'active',
		vibrancy: 'under-window',
	};

	if (process.platform === 'darwin')
		windowOpts.frame = false;

	if (process.platform === 'darwin')
		windowOpts.frame = false;
	if (process.platform !== 'darwin')
		windowOpts.height = 550;

	const window = createWindow(windowOpts, 'welcome');

	stackMap.welcome = window.id;

	return window.id;
}

export function createPreferencesWindow() {
	const existing = stackMap.preferences;

	if (existing && windowStack[existing]) {
		if (windowStack[existing].isMinimized())
			windowStack[existing].restore();

		windowStack[existing].focus();

		return existing;
	}

	const windowOpts: BrowserWindowConstructorOptions = {
		height: 550,
		width: 900,
		resizable: false,
		title: 'Beak preferences',
		autoHideMenuBar: true,
		transparent: true,
		titleBarStyle: 'hiddenInset',
		visualEffectState: 'active',
		vibrancy: 'under-window',
	};

	if (process.platform === 'darwin')
		windowOpts.frame = false;

	const window = createWindow(windowOpts, 'preferences');

	stackMap.preferences = window.id;

	return window.id;
}

export function createProjectMainWindow(projectFilePath: string) {
	const windowOpts: BrowserWindowConstructorOptions = {
		height: 850,
		width: 1400,
		minHeight: 450,
		minWidth: 1150,
		title: 'Loading... - Beak',
		titleBarStyle: 'hiddenInset',
		visualEffectState: 'active',
	};

	// Hopefully vibrancy comes to windows soon
	if (process.platform === 'darwin') {
		windowOpts.frame = false;
		windowOpts.transparent = true;
		windowOpts.vibrancy = 'under-window';
	}

	// On Linux and Windows we want total control of the frame
	if (process.platform !== 'darwin')
		windowOpts.autoHideMenuBar = false;

	const window = createWindow(windowOpts, 'project-main');

	window.setRepresentedFilename(projectFilePath);

	return window.id;
}

export function createPortalWindow() {
	const existing = stackMap.portal;

	if (existing && windowStack[existing]) {
		if (windowStack[existing].isMinimized())
			windowStack[existing].restore();

		windowStack[existing].focus();

		return existing;
	}

	const windowOpts: BrowserWindowConstructorOptions = {
		height: 400,
		width: 800,
		resizable: false,
		title: 'Welcome to Beak',
		autoHideMenuBar: true,
		transparent: true,
		titleBarStyle: 'hiddenInset',
		visualEffectState: 'active',
		vibrancy: 'under-window',
	};

	if (process.platform === 'darwin')
		windowOpts.frame = false;

	const window = createWindow(windowOpts, 'portal');

	stackMap.portal = window.id;

	return window.id;
}