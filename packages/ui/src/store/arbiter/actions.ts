import { createAction } from '@reduxjs/toolkit';

import { ActionTypes } from './types';

export const startArbiter = createAction(ActionTypes.START_ARBITER);
export const updateStatus = createAction<boolean>(ActionTypes.UPDATE_STATUS);

export default {
	startArbiter,
	updateStatus,
};
