import { RequestPreference } from '@beak/common/types/beak-hub';
import { ipcFsService } from '@beak/ui/lib/ipc';
import { call, select } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import path from 'path-browserify';

import { ApplicationState } from '../..';
import { RequestPreferencePayload } from '../types';

export default function* catchWriteRequestPreferences({ payload }: PayloadAction<RequestPreferencePayload>) {
	const { id } = payload;
	const preferences: RequestPreference = yield select((s: ApplicationState) => s.global.preferences.requests[id]);

	if (!preferences)
		return;

	yield call(writeRequestPreferences, preferences, id);
}

async function writeRequestPreferences(preferences: RequestPreference, id: string) {
	const preferencesPath = path.join('.beak', 'preferences', 'requests', `${id}.json`);

	await ipcFsService.writeJson(preferencesPath, preferences);
}
