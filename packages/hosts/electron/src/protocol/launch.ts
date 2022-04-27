import { BrowserWindow, dialog } from 'electron';

import persistentStore from '../lib/persistent-store';
import { tryOpenProjectFolder, windowProjectIdMapping } from '../lib/project';
import { windowStack } from '../window-management';

export default async function handleLaunch(url: URL) {
	switch (url.pathname) {
		case '/project':
			return await handleProject(url);

		default: return null;
	}
}

async function handleProject(url: URL) {
	const projectId = url.searchParams.get('projectId');
	const requestId = url.searchParams.get('requestId');

	if (!projectId || !requestId)
		return false;

	// Check if the project already has a window open
	const existingWindowId = windowProjectIdMapping[projectId];

	if (existingWindowId) {
		const window = windowStack[existingWindowId];

		if (window && !window.isDestroyed()) {
			window.focus();

			if (requestId)
				window.webContents.send('reveal_request', { requestId });

			return true;
		}
	}

	// Check if project is known about
	const projectPath = persistentStore.get('projectMappings')[projectId];

	if (!projectPath) {
		await dialog.showMessageBox({
			type: 'info',
			title: 'Unable to open project',
			message: 'The share link you clicked was for a project you don\'t have on your machine.',
		});

		return false;
	}

	const windowId = await tryOpenProjectFolder(projectPath);

	if (!windowId)
		return false;

	if (requestId) {
		const window = BrowserWindow.fromId(windowId);

		await new Promise(resolve => setTimeout(resolve, 1500));

		window?.webContents.send('reveal_request', { requestId });
	}

	return true;
}