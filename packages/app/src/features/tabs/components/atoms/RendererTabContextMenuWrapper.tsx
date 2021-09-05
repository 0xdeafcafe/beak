import ContextMenu from '@beak/app/components/atoms/ContextMenu';
import { actions } from '@beak/app/store/project';
import { TabItem } from '@beak/common/types/beak-project';
import type { MenuItemConstructorOptions } from 'electron';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ksuid from '@cuvva/ksuid';

interface RendererTabContextMenuWrapperProps {
	tab: TabItem;
	target: HTMLElement | undefined;
}

const RendererTabContextMenuWrapper: React.FunctionComponent<RendererTabContextMenuWrapperProps> = props => {
	const dispatch = useDispatch();
	const { tab, target, children } = props;
	const { tabs, selectedTabPayload } = useSelector(s => s.global.project)!;
	const [menuItems, setMenuItems] = useState<MenuItemConstructorOptions[]>([]);

	useEffect(() => {
		const selectedIndex = tabs.findIndex(t => t.payload === tab.payload);
		const startTab = selectedIndex <= 0;
		const endTab = selectedIndex === tabs.length - 1;

		setMenuItems([
			{
				id: ksuid.generate('ctxmenuitem').toString(),
				label: 'Close',
				click: () => {
					dispatch(actions.closeSelectedTab(tab.payload));
				},
			},
			{
				id: ksuid.generate('ctxmenuitem').toString(),
				label: 'Close Others',
				click: () => {
					dispatch(actions.closeOtherSelectedTabs(tab.payload));
				},
			},
			{
				id: ksuid.generate('ctxmenuitem').toString(),
				label: 'Close to the Right',
				enabled: !endTab,
				click: () => {
					dispatch(actions.closeSelectedTabsToRight(tab.payload));
				},
			},
			{
				id: ksuid.generate('ctxmenuitem').toString(),
				label: 'Close to the Left',
				enabled: !startTab,
				click: () => {
					dispatch(actions.closeSelectedTabsToLeft(tab.payload));
				},
			},
			{
				id: ksuid.generate('ctxmenuitem').toString(),
				label: 'Close All',
				click: () => {
					dispatch(actions.closeAllSelectedTabs());
				},
			},

			{ type: 'separator' },
		]);
	}, [tab, selectedTabPayload, tabs]);

	return (
		<ContextMenu menuItems={menuItems} target={target}>
			{children}
		</ContextMenu>
	);
};

export default RendererTabContextMenuWrapper;
