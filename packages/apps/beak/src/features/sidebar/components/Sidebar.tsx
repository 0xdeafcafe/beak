import React, { useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import WindowSessionContext from '@beak/app-beak/contexts/window-session-context';
import { checkShortcut } from '@beak/app-beak/lib/keyboard-shortcuts';
import { sidebarPreferenceSetCollapse, sidebarPreferenceSetSelected } from '@beak/app-beak/store/preferences/actions';
import { useAppSelector } from '@beak/app-beak/store/redux';
import { SidebarVariant } from '@beak/shared-common/types/beak-hub';
import { MenuEventPayload } from '@beak/shared-common/web-contents/types';
import styled, { css } from 'styled-components';

import ProjectPane from '../../project-pane/components/ProjectPane';
import VariablesPane from '../../variables/components/VariablesPane';
import SidebarMenuHighlighter from './molecules/SidebarMenuHighlighter';
import SidebarMenuItem from './molecules/SidebarMenuItem';

const sidebarVariants: SidebarVariant[] = ['project', 'variables'];

const Sidebar: React.FC<React.PropsWithChildren<unknown>> = () => {
	const windowSession = useContext(WindowSessionContext);
	const selectedSidebar = useAppSelector(s => s.global.preferences.sidebar.selected);
	const sidebarCollapsed = useAppSelector(s => s.global.preferences.sidebar.collapsed.sidebar);
	const dispatch = useDispatch();

	const variantIndex = sidebarVariants.indexOf(selectedSidebar);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			switch (true) {
				case checkShortcut('sidebar.toggle-view', event):
					event.stopPropagation();
					dispatch(sidebarPreferenceSetCollapse({ key: 'sidebar', collapsed: !sidebarCollapsed }));

					break;

				default:
					return;
			}

			event.preventDefault();
		};

		function listener(_event: unknown, payload: MenuEventPayload) {
			const { code } = payload;

			if (code !== 'toggle_sidebar')
				return;

			dispatch(sidebarPreferenceSetCollapse({ key: 'sidebar', collapsed: !sidebarCollapsed }));
		}

		window.secureBridge.ipc.on('menu:menu_item_click', listener);
		window.addEventListener('keydown', onKeyDown);

		return () => {
			window.secureBridge.ipc.off('menu:menu_item_click', listener);
			window.removeEventListener('keydown', onKeyDown);
		};
	}, [dispatch, sidebarCollapsed]);

	function usefulSetVariant(newVariant: SidebarVariant) {
		if (selectedSidebar === newVariant) {
			dispatch(sidebarPreferenceSetCollapse({ key: 'sidebar', collapsed: !sidebarCollapsed }));
		} else {
			dispatch(sidebarPreferenceSetSelected(newVariant));
			dispatch(sidebarPreferenceSetCollapse({ key: 'sidebar', collapsed: false }));
		}
	}

	return (
		<Container $darwin={windowSession.isDarwin()}>
			<DragBar $collapsed={sidebarCollapsed} />
			{sidebarCollapsed && <CollapsedLogo />}
			<SidebarMenu $collapsed={sidebarCollapsed}>
				<SidebarMenuHighlighter hidden={sidebarCollapsed} index={variantIndex} />

				<SidebarMenuItem
					item={'project'}
					selectedItem={selectedSidebar}
					onClick={usefulSetVariant}
				/>
				<SidebarMenuItem
					item={'variables'}
					selectedItem={selectedSidebar}
					onClick={usefulSetVariant}
				/>
			</SidebarMenu>

			{selectedSidebar === 'project' && <ProjectPane />}
			{selectedSidebar === 'variables' && <VariablesPane />}
		</Container>
	);
};

const Container = styled.div<{ $darwin: boolean }>`
	position: relative;
	display: grid;
	grid-template-columns: 40px 1fr;
	height: calc(100% - 72px);
	padding-top: 72px;
	background: ${p => p.$darwin ? 'transparent' : p.theme.ui.background};
	overflow: hidden;
`;

const DragBar = styled.div<{ $collapsed: boolean }>`
	position: absolute;
	top: 0; left: 0; right: 0;
	height: 71px;
	-webkit-app-region: drag;

	${p => p.$collapsed && css`
		background: ${p => p.theme.ui.secondarySurface};
		border-bottom: 1px solid ${p => p.theme.ui.backgroundBorderSeparator};
	`}
`;

const CollapsedLogo = styled.div`
	position: absolute;
	top: 0; left: 0; right: 0;
	height: 71px;

	background: url('./images/logo.svg');
	background-position: center 85%;
	background-size: 20px;
	background-repeat: no-repeat;
	transform: scaleX(-1);
	/* filter: brightness(0) invert(1); */
`;

const SidebarMenu = styled.div<{ $collapsed: boolean }>`
	position: relative;
	width: 40px;

	${p => p.$collapsed && css`border-right: 2px solid ${p.theme.ui.backgroundBorderSeparator};`}
`;

export default Sidebar;