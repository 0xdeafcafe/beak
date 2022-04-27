import { changeTab, makeTabPermanent } from '@beak/app-beak/features/tabs/store/actions';
import { moveNodesOnDisk } from '@beak/app-beak/lib/beak-project/nodes';
import { TabItem, Tree } from '@beak/shared-common/types/beak-project';
import { PayloadAction } from '@reduxjs/toolkit';
import { call, delay, put, select } from 'redux-saga/effects';

import { ApplicationState } from '../..';
import { MoveNodeOnDiskPayload } from '../types';

export default function* workerMoveNodeOnDisk({ payload }: PayloadAction<MoveNodeOnDiskPayload>) {
	const tree: Tree = yield select((s: ApplicationState) => s.global.project.tree);
	const sourceNode = tree[payload.sourceNodeId];
	const destinationNode = tree[payload.destinationNodeId];
	const tabs: TabItem[] = yield select((s: ApplicationState) => s.features.tabs.activeTabs);

	const openedTab = tabs.find(t => t.type === 'request' && t.payload === sourceNode.id);

	if (!sourceNode)
		return;

	if (!destinationNode && payload.destinationNodeId !== 'root')
		return;

	yield call(moveNodesOnDisk, sourceNode, destinationNode);

	if (!openedTab)
		return;

	yield delay(300);
	yield put(changeTab({ type: 'request', payload: openedTab.payload, temporary: false }));
	yield put(makeTabPermanent(openedTab.payload));
}