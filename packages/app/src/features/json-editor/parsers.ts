import { TypedObject } from '@beak/common/helpers/typescript';
import { Entries, EntryMap, NamedEntries } from '@beak/common/types/beak-json-editor';
import { VariableGroups } from '@beak/common/types/beak-project';
// @ts-ignore
import ksuid from '@cuvva/ksuid';

import { parseValueParts } from '../variable-input/parser';

type JsonTypes = null | string | number | boolean | Record<string, unknown> | unknown[];

export function convertToRealJson(
	selectedGroups: Record<string, string>,
	variableGroups: VariableGroups,
	entries: EntryMap,
) {
	const root = TypedObject.values(entries).find(e => e.parentId === null);

	if (!root || !root.enabled)
		return null;

	return convertEntry(selectedGroups, variableGroups, entries, root);
}

function convertEntry(
	selectedGroups: Record<string, string>,
	variableGroups: VariableGroups,
	entries: EntryMap,
	entry: Entries,
): JsonTypes {
	switch (entry.type) {
		case 'null':
		case 'boolean':
			return entry.value;

		case 'number':
			return Number(parseValueParts(selectedGroups, variableGroups, entry.value));

		case 'string':
			return parseValueParts(selectedGroups, variableGroups, entry.value);

		case 'array': {
			const children = TypedObject
				.values(entries)
				.filter(e => e.parentId === entry.id && e.enabled);

			return children.map(c => convertEntry(selectedGroups, variableGroups, entries, c));
		}

		case 'object': {
			const children = TypedObject
				.values(entries)
				.filter(e => e.parentId === entry.id && e.enabled) as NamedEntries[];

			return children.reduce((acc, val) => ({
				...acc,
				[val.name]: convertEntry(selectedGroups, variableGroups, entries, val),
			}), {});
		}

		default:
			return null;
	}
}

export function convertToEntryJson(json: JsonTypes, parentId: string | null = null, name?: string): EntryMap {
	const out: EntryMap = {};
	const id = ksuid.generate('jsonentry').toString() as string;

	switch (true) {
		case typeof json === 'number':
		case typeof json === 'string':
			out[id] = {
				id,
				name,
				enabled: true,
				parentId,
				type: typeof json,
				value: [json],
			} as Entries;
			break;

		case typeof json === 'boolean':
			out[id] = {
				id,
				name,
				enabled: true,
				parentId,
				type: 'boolean',
				value: json,
			} as Entries;
			break;

		case json === null:
			out[id] = {
				id,
				name,
				enabled: true,
				parentId,
				type: 'null',
				value: null,
			} as Entries;
			break;

		case Array.isArray(json): {
			out[id] = {
				id,
				name,
				enabled: true,
				parentId,
				type: 'array',
			} as Entries;

			(json as JsonTypes[])
				.map(e => convertToEntryJson(e, id))
				.map(e => TypedObject.keys(e).forEach(k => {
					out[k] = e[k];
				}));

			break;
		}

		case typeof json === 'object': {
			out[id] = {
				id,
				name,
				enabled: true,
				parentId,
				type: 'object',
			} as Entries;

			TypedObject
				.keys(json as Record<string, JsonTypes>)
				.map(key => convertToEntryJson((json as Record<string, JsonTypes>)[key], id, key))
				.map(e => TypedObject.keys(e).forEach(k => {
					out[k] = e[k];
				}));

			break;
		}

		default:
			break;
	}

	return out;
}