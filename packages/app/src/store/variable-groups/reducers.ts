/* eslint-disable no-param-reassign */
import { generateValueIdent } from '@beak/app/lib/beak-variable-group/utils';
import { TypedObject } from '@beak/common/helpers/typescript';
import ksuid from '@cuvva/ksuid';
import { createReducer } from '@reduxjs/toolkit';

import * as actions from './actions';
import { initialState } from './types';

const variableGroupsReducer = createReducer(initialState, builder => {
	builder
		.addCase(actions.startVariableGroups, state => {
			state.loaded = false;
		})
		.addCase(actions.variableGroupsOpened, (state, { payload }) => {
			state.variableGroups = payload;
			state.loaded = true;
		})

		.addCase(actions.updateVg, (state, { payload }) => {
			const { name, file } = payload;

			state.variableGroups[name] = file;
		})
		.addCase(actions.removeVg, (state, { payload }) => {
			const { [payload]: remove, ...rest } = state.variableGroups;

			state.variableGroups = rest;
		})

		.addCase(actions.updateGroupName, (state, action) => {
			const { ident, updated, variableGroup } = action.payload;

			state.variableGroups![variableGroup].groups[ident] = updated;
		})
		.addCase(actions.updateItemName, (state, action) => {
			const { ident, updated, variableGroup } = action.payload;

			state.variableGroups![variableGroup].items[ident] = updated;
		})
		.addCase(actions.updateValue, (state, action) => {
			const { groupId, itemId, updated, variableGroup } = action.payload;
			const ident = generateValueIdent(groupId, itemId);
			const vg = state.variableGroups![variableGroup];
			const exists = ident !== void 0 && vg.values[ident];
			const empty = updated.length === 0 || (updated.length === 1 && updated[0] === '');

			if (exists) {
				if (empty) {
					delete vg.values[ident!];

					return;
				}

				vg.values[ident!] = updated;
			} else {
				vg.values[ident] = updated;
			}
		})

		.addCase(actions.insertNewVariableGroup, (state, action) => {
			if (action.payload === null) {
				const groupId = ksuid.generate('group').toString();
				const itemId = ksuid.generate('item').toString();

				state.variableGroups!.Environment = {
					groups: { [groupId]: 'Production' },
					items: { [itemId]: 'env_identifier' },
					values: { [`${groupId}&${itemId}`]: ['prod'] },
				};

				return;
			}

			const { name } = action.payload;
			const groupId = ksuid.generate('group').toString();
			const itemId = ksuid.generate('item').toString();

			state.variableGroups![name] = {
				groups: { [groupId]: 'Group' },
				items: { [itemId]: 'Item' },
				values: { },
			};
		})
		.addCase(actions.insertNewGroup, (state, action) => {
			const { group, variableGroup } = action.payload;

			state.variableGroups![variableGroup].groups[ksuid.generate('group').toString()] = group;
		})
		.addCase(actions.insertNewItem, (state, action) => {
			const { name, variableGroup } = action.payload;

			state.variableGroups![variableGroup].items[ksuid.generate('item').toString()] = name;
		})
		.addCase(actions.removeGroup, (state, action) => {
			const { id, variableGroup } = action.payload;

			TypedObject
				.keys(state.variableGroups[variableGroup].values)
				.filter(k => k.startsWith(id))
				.forEach(k => {
					// @ts-expect-error
					state.variableGroups[variableGroup].values[k] = void 0;
				});

			delete state.variableGroups![variableGroup].groups[id];
		})
		.addCase(actions.removeItem, (state, action) => {
			const { id, variableGroup } = action.payload;

			TypedObject
				.keys(state.variableGroups[variableGroup].values)
				.filter(k => k.endsWith(id))
				.forEach(k => {
					// @ts-expect-error
					state.variableGroups[variableGroup].values[k] = void 0;
				});

			delete state.variableGroups![variableGroup].items[id];
		})

		.addCase(actions.changeSelectedGroup, (state, action) => {
			const { group, variableGroup } = action.payload;

			state.selectedGroups[variableGroup] = group;
		})

		.addCase(actions.setLatestWrite, (state, { payload }) => {
			state.latestWrite = payload;
		})
		.addCase(actions.setWriteDebounce, (state, { payload }) => {
			state.writeDebouncer = payload;
		});
});

export default variableGroupsReducer;
