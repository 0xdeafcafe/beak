import RequestPreferencesContext from '@beak/app/features/request-pane/contexts/request-preferences-context';
import { actions } from '@beak/app/store/project';
import { TypedObject } from '@beak/common/helpers/typescript';
import { NamedObjectEntry, ObjectEntry } from '@beak/common/types/beak-json-editor';
import { RequestBodyJson, RequestNode } from '@beak/common/types/beak-project';
import React, { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
	BodyAction,
	BodyInputWrapper,
	BodyLabelValueCell,
	BodyNameOverrideWrapper,
	BodyPrimaryCell,
	BodyTypeCell,
} from '../atoms/Cells';
import { Row } from '../atoms/Structure';
import EntryActions from './EntryActions';
import EntryFolder from './EntryFolder';
import EntryToggler from './EntryToggler';
import { detectName, JsonEntry, JsonEntryProps } from './JsonEntry';
import TypeSelector from './TypeSelector';

interface JsonObjectEntryProps extends JsonEntryProps {
	value: ObjectEntry | NamedObjectEntry;
}

const JsonObjectEntry: React.FunctionComponent<JsonObjectEntryProps> = props => {
	const { depth, requestId, value, nameOverride } = props;
	const { id } = value;
	const reqPref = useContext(RequestPreferencesContext);
	const [expanded, setExpanded] = useState(reqPref!.getPreferences().jsonEditor?.expands[id] !== false);
	const dispatch = useDispatch();

	const entries = useSelector(s =>
		((s.global.project.tree[requestId] as RequestNode).info.body as RequestBodyJson).payload,
	);
	const children = TypedObject.values(entries).filter(e => e.parentId === id);

	return (
		<React.Fragment>
			<Row>
				<BodyPrimaryCell depth={depth}>
					<EntryFolder
						id={id}
						expanded={expanded}
						requestId={requestId}
						onChange={expanded => setExpanded(expanded)}
					/>
					<EntryToggler
						id={id}
						requestId={requestId}
						value={value.enabled}
					/>
					<BodyInputWrapper>
						{nameOverride === void 0 && (
							<input
								disabled={depth === 0}
								type={'text'}
								value={detectName(depth, value)}
								onChange={e => dispatch(actions.requestBodyJsonEditorNameChange({
									id,
									requestId,
									name: e.target.value,
								}))}
							/>
						)}
						{nameOverride !== void 0 && (
							<BodyNameOverrideWrapper>{nameOverride}</BodyNameOverrideWrapper>
						)}
					</BodyInputWrapper>
				</BodyPrimaryCell>
				<BodyTypeCell>
					<TypeSelector
						id={id}
						requestId={requestId}
						value={value.type}
					/>
				</BodyTypeCell>
				<BodyLabelValueCell>
					{`${children.length} ${children.length === 1 ? 'key' : 'keys'}`}
				</BodyLabelValueCell>
				<BodyAction>
					<EntryActions id={id} entry={value} requestId={requestId} />
				</BodyAction>
			</Row>
			{expanded && children.map(c => (
				<JsonEntry
					// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
					depth={depth + 1}
					key={c.id}
					requestId={requestId}
					value={c}
				/>
			))}
		</React.Fragment>
	);
};

export default JsonObjectEntry;
