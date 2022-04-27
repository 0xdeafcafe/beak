import React, { useContext } from 'react';
import { useDispatch } from 'react-redux';
import WindowSessionContext from '@beak/app-beak/contexts/window-session-context';
import { changeTab, makeTabPermanent } from '@beak/app-beak/features/tabs/store/actions';
import TreeView from '@beak/app-beak/features/tree-view/components/TreeView';
import { TreeViewItem, TreeViewNodes } from '@beak/app-beak/features/tree-view/types';
import { ipcExplorerService } from '@beak/app-beak/lib/ipc';
import { checkShortcut } from '@beak/app-beak/lib/keyboard-shortcuts';
import { useAppSelector } from '@beak/app-beak/store/redux';
import { actions } from '@beak/app-beak/store/variable-groups';
import { removeVariableGroupFromDisk } from '@beak/app-beak/store/variable-groups/actions';
import { TypedObject } from '@beak/shared-common/helpers/typescript';
import ksuid from '@cuvva/ksuid';
import type { MenuItemConstructorOptions } from 'electron';
import styled from 'styled-components';

const VariableGroups: React.FC<React.PropsWithChildren<unknown>> = () => {
	const dispatch = useDispatch();
	const selectedTabId = useAppSelector(s => s.features.tabs.selectedTab);
	const variableGroups = useAppSelector(s => s.global.variableGroups.variableGroups);
	const variableGroupKeys = TypedObject.keys(variableGroups);

	const windowSession = useContext(WindowSessionContext);
	const darwin = windowSession.isDarwin();

	const tree = variableGroupKeys.reduce<TreeViewNodes>((acc, k) => ({
		...acc,
		[k]: {
			id: k,
			type: 'variable-group',
			filePath: `variable-groups/${k}.json`,
			name: k,
			parent: 'variable-groups',
		},
	}), {} as TreeViewNodes);

	const empty = variableGroupKeys.length === 0;

	function generateContextMenu(node: TreeViewItem): MenuItemConstructorOptions[] {
		return [{
			id: ksuid.generate('ctxmenuitem').toString(),
			label: 'New variable group',
			click: () => {
				dispatch(actions.createNewVariableGroup({ }));
			},
		}, {
			id: ksuid.generate('ctxmenuitem').toString(),
			label: `Reveal in ${darwin ? 'Finder' : 'Explorer'}`,
			enabled: node.id !== 'root',
			click: () => {
				ipcExplorerService.revealFile(node.filePath);
			},
		},

		{ id: ksuid.generate('ctxmenuitem').toString(), type: 'separator' },

		{ id: ksuid.generate('ctxmenuitem').toString(), label: 'Copy', enabled: false },
		{ id: ksuid.generate('ctxmenuitem').toString(), label: 'Cut', enabled: false },
		{ id: ksuid.generate('ctxmenuitem').toString(), label: 'Paste', enabled: false },

		{ id: ksuid.generate('ctxmenuitem').toString(), type: 'separator' },

		{
			id: ksuid.generate('ctxmenuitem').toString(),
			label: 'Copy path',
			enabled: node.id !== 'root',
			click: () => ipcExplorerService.copyFullNodePath(node.filePath),
		},
		{
			id: ksuid.generate('ctxmenuitem').toString(),
			label: 'Copy relative path',
			enabled: node.id !== 'root',
			click: () => navigator.clipboard.writeText(node.filePath),
		},

		{ id: ksuid.generate('ctxmenuitem').toString(), type: 'separator' },

		{
			id: ksuid.generate('ctxmenuitem').toString(),
			label: 'Rename',
			accelerator: darwin ? 'Return' : 'F2',
			enabled: node.id !== 'root',
			click: () => {
				if (node.id === 'root')
					return;

				dispatch(actions.renameStarted({ id: node.id }));
			},
		}, {
			id: ksuid.generate('ctxmenuitem').toString(),
			label: 'Delete',
			accelerator: 'CmdOrCtrl+Backspace',
			enabled: node.id !== 'root',
			click: () => {
				dispatch(actions.removeVariableGroupFromDisk({ id: node.id, withConfirmation: true }));
			},
		}];
	}

	function handleNodeClick(_event: React.MouseEvent<HTMLDivElement>, node: TreeViewItem) {
		if (node.type === 'folder')
			return;

		dispatch(changeTab({
			type: 'variable_group_editor',
			payload: node.id,
			temporary: true,
		}));
	}

	function handleNodeDoubleClick(_event: React.MouseEvent<HTMLDivElement>, node: TreeViewItem) {
		if (node.type === 'folder')
			return;

		dispatch(makeTabPermanent(node.id));
	}

	function handleNodeKeyDown(event: React.KeyboardEvent<HTMLDivElement>, node: TreeViewItem) {
		switch (true) {
			case checkShortcut('variable-groups.variable-group.open', event) && node.type !== 'folder':
				dispatch(changeTab({ type: 'variable_group_editor', payload: node.id, temporary: false }));
				break;

			case checkShortcut('variable-groups.variable-group.delete', event) && node.type !== 'folder':
				dispatch(removeVariableGroupFromDisk({ id: node.id, withConfirmation: true }));
				break;

			default: return;
		}

		event.preventDefault();
	}

	return (
		<React.Fragment>
			{empty && <EmptyWarning>{'It\'s looking empty in here...'}</EmptyWarning>}

			<TreeView
				tree={tree}
				activeNodeId={selectedTabId}
				focusedNodeId={selectedTabId}
				rootParentName={'variable-groups'}

				renameSelector={(_node, state) => state.global.variableGroups.activeRename}
				onRenameStarted={node => dispatch(actions.renameStarted({ id: node.id }))}
				onRenameEnded={node => dispatch(actions.renameCancelled({ id: node.id }))}
				onRenameUpdated={(node, name) => dispatch(actions.renameUpdated({ id: node.id, name }))}
				onRenameSubmitted={node => dispatch(actions.renameSubmitted({ id: node.id }))}

				onContextMenu={generateContextMenu}
				onNodeClick={handleNodeClick}
				onNodeDoubleClick={handleNodeDoubleClick}
				onNodeKeyDown={handleNodeKeyDown}
			/>
		</React.Fragment>
	);
};

const EmptyWarning = styled.div`
	color: ${p => p.theme.ui.textMinor};
	margin-left: 5px;
	font-size: 13px;
`;

export default VariableGroups;