import { EntryMap } from './beak-json-editor';

export interface ProjectFile {
	id: string;
	name: string;
	version: string;
}

export interface RequestNodeFile extends RequestOverview {
	id: string;
}

export interface SupersecretFile {
	encryption: {
		algo: 'aes-256-ctr';
		key: string;
	};
}

export interface Node {
	id: string;
	type: 'folder' | 'request';
	name: string;
	filePath: string;
	parent: string | null;
}

export interface FolderNode extends Node {
	type: 'folder';
}

export interface RequestNode extends Node {
	type: 'request';
	info: RequestOverview;
}

export interface ToggleKeyValue {
	name: string;
	value: ValueParts;
	enabled: boolean;
}

export interface RequestOverview {
	verb: string;
	url: ValueParts;
	query: Record<string, ToggleKeyValue>;
	headers: Record<string, ToggleKeyValue>;
	body: RequestBody;
	options: RequestOptions;
}

export type RequestBodyType = 'text' | 'json' | 'url_encoded_form';
export type RequestBody = RequestBodyText | RequestBodyJson | RequestBodyUrlEncodedForm;

export interface RequestBodyText {
	type: 'text';
	payload: string;
}

export interface RequestBodyJson {
	type: 'json';
	payload: EntryMap;
}

export interface RequestBodyUrlEncodedForm {
	type: 'url_encoded_form';
	payload: Record<string, ToggleKeyValue>;
}

export interface RequestOptions {
	followRedirects: boolean;
}

export interface ResponseOverview {
	headers: Record<string, string>;
	redirected: boolean;
	status: number;
	url: string;
	hasBody: boolean;
}

export interface VariableGroup {
	groups: Record<string, string>;
	items: Record<string, string>;
	values: Record<string, ValueParts>;
}

export type ValueParts = (string | RealtimeValuePart)[];

export type RealtimeValuePart = VariableGroupItemRtv | NonceRtv | SecureRtv | PrivateRtv | TimestampRtv;

export interface VariableGroupItemRtv {
	type: 'variable_group_item';
	payload: {
		itemId: string;
	};
}

export interface NonceRtv {
	type: 'nonce';
	payload: void;
}

export interface SecureRtv {
	type: 'secure';
	payload: {
		iv: string;
		datum: string;
	};
}

export interface PrivateRtv {
	type: 'private';
	payload: {
		iv: string;
		identifier: string;
	};
}

export interface TimestampRtv {
	type: 'timestamp';
	payload: {
		type: string;
	};
}

export type Nodes = FolderNode | RequestNode;
export type Tree = Record<string, Nodes>;
export type VariableGroups = Record<string, VariableGroup>;

// NOTE(afr): Adding a new tab item? Don't forget to update user-preferences schema too!
export type TabItem = RequestTabItem | RendererTabItem;

export interface TabBase {
	temporary: boolean;
}

export interface RequestTabItem extends TabBase {
	type: 'request';
	payload: string;
}

export interface RendererTabItem extends TabBase {
	type: 'renderer';
	payload: 'variable_group_editor';
}
