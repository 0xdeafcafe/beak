/* eslint-disable @typescript-eslint/no-var-requires */
const { contextBridge, ipcRenderer } = require('electron');
const { init } = require('@sentry/electron/dist/renderer');
/* eslint-enable @typescript-eslint/no-var-requires */

// Sentry
init({
	dsn: 'https://5118444e09d74b03a320d0e604aa68ff@o988021.ingest.sentry.io/5945114',
	appName: 'Renderer process',
	environment: process.env.ENVIRONMENT,
	release: process.env.RELEASE_IDENTIFIER,
});

// Secure Bridge
contextBridge.exposeInMainWorld('secureBridge', {
	ipc: {
		invoke: async (channel, payload) => ipcRenderer.invoke(channel, payload),
		on: (channel, listener) => ipcRenderer.on(channel, listener),
		removeListener: (channel, listener) => ipcRenderer.removeListener(channel, listener),
	},
});
