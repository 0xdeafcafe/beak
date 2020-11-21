import { TypedObject } from '@beak/common/dist/helpers/typescript';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

export interface VariableSelectorProps {
	parent: HTMLElement;
	query: string;
	onDone: (vg: string, itemId: string) => void;
	onClose: () => void;
	position: {
		top: number;
		left: number;
	};
	keyPassthrough?: {
		code: string;
		invalidator: string;
	};
}

interface Item {
	varibleGroupName: string;
	itemId: string;
	itemName: string;
}

const VariableSelector: React.FunctionComponent<VariableSelectorProps> = props => {
	const {
		onDone,
		query,
		parent,
		position,
	} = props;
	const variableGroups = useSelector(s => s.global.variableGroups.variableGroups)!;
	const [active, setActive] = useState<string | undefined>(void 0);

	const items = TypedObject.keys(variableGroups)
		.map(vgKey => {
			const vg = variableGroups[vgKey];

			return TypedObject.keys(vg.items).reduce<Item[]>((acc, val) => ([
				...acc,
				{
					varibleGroupName: vgKey,
					itemId: val,
					itemName: vg.items[val],
				},
			]), []);
		})
		.flat();

	useEffect(() => {
		if (!active)
			setActive(items[0]?.itemId || void 0);
	}, [active, setActive, items]);

	return (
		<Wrapper style={{
			top: position.top,
			left: position.left,
		}}>
			{items.map(i => (
				<Item
					active={active === i.itemId}
					className={'variable-selector'}
					key={i.itemId}
					tabIndex={0}
					onClick={() => setActive(i.itemId)}
					onDoubleClick={() => onDone(i.varibleGroupName, i.itemId)}
				>
					{`${i.varibleGroupName} (${i.itemName})`}
				</Item>
			))}
		</Wrapper>
	);
};

const Wrapper = styled.div`
	position: fixed;
	border: 1px solid ${p => p.theme.ui.backgroundBorderSeparator};

	font-size: 12px;

	max-height: 120px;
	min-width: 350px;
	max-width: 400px;

	overflow-y: scroll;
`;

const Item = styled.div<{ active: boolean }>`
	padding: 2px 4px;
	cursor: pointer;
	color: ${p => p.theme.ui.textOnAction};
	background: ${p => p.theme.ui.surface};

	&:focus {
		background-color: ${p => p.theme.ui.primaryFill};
		outline: none;
	}

	${p => p.active ? `background-color: ${p.theme.ui.primaryFill};'` : ''}
`;

export default VariableSelector;
