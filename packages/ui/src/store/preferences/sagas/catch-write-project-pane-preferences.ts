import { ProjectPanePreferences } from '@beak/common/types/beak-hub';
import { ipcFsService } from '@beak/ui/lib/ipc';
import { call, select } from '@redux-saga/core/effects';
import path from 'path-browserify';

import { ApplicationState } from '../..';

export default function* catchWriteProjectPanePreferences() {
	const preferences: ProjectPanePreferences = yield select((s: ApplicationState) => s.global.preferences.projectPane);

	if (!preferences)
		return;

	yield call(writeProjectPanePreferences, preferences);
}

async function writeProjectPanePreferences(preferences: ProjectPanePreferences) {
	const preferencesPath = path.join('.beak', 'preferences', 'project-pane.json');

	await ipcFsService.writeJson(preferencesPath, preferences);
}
