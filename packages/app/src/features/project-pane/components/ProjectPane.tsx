import WindowSessionContext from '@beak/app/contexts/window-session-context';
import { actions } from '@beak/app/store/project';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { useTheme } from 'styled-components';

import Header from './atoms/Header';
import SectionHeader from './atoms/SectionHeader';
import Git from './organisms/Git';
import TreeView from './organisms/TreeView';
import VariableGroups from './organisms/VariableGroups';

interface Collapser {
	project: boolean;
	variableGroup: boolean;
	explorer: boolean;
}

const ProjectPane: React.FunctionComponent = () => {
	const dispatch = useDispatch();
	const theme = useTheme();
	const project = useSelector(s => s.global.project);
	const windowSession = useContext(WindowSessionContext);
	const [collapser, setCollapser] = useState<Collapser>({
		project: false,
		variableGroup: false,
		explorer: false,
	});

	function toggleCollapser(key: keyof Collapser) {
		setCollapser({
			...collapser,
			[key]: !collapser[key],
		});
	}

	return (
		<Container $darwin={windowSession.isDarwin()}>
			<TitleBar />
			<Header>{project.name!}</Header>
			<SectionHeader
				collapsed={collapser.project}
				onClick={() => toggleCollapser('project')}
			>
				{'Project'}
			</SectionHeader>
			<Git collapsed={collapser.project} />
			<SectionHeader
				collapsed={collapser.variableGroup}
				onClick={() => toggleCollapser('variableGroup')}
			>
				{'Variable groups'}

				<FontAwesomeIcon
					icon={faBars}
					color={theme.ui.textOnSurfaceBackground}
					size={'1x'}
					onClick={e => {
						e.stopPropagation();

						dispatch(actions.tabSelected({
							type: 'renderer',
							payload: 'variable_group_editor',
							temporary: false,
						}));
					}}
				/>
			</SectionHeader>
			<VariableGroups collapsed={collapser.variableGroup} />
			<SectionHeader
				collapsed={collapser.explorer}
				onClick={() => toggleCollapser('explorer')}
			>
				{'Explorer'}
			</SectionHeader>
			<TreeView
				collapsed={collapser.explorer}
				tree={project.tree!}
			/>
		</Container>
	);
};

const Container = styled.div<{ $darwin: boolean }>`
	display: flex;
	flex-direction: column;

	background: ${p => p.$darwin ? 'transparent' : p.theme.ui.background};

	height: 100%;
`;

const TitleBar = styled.div`
	height: 40px;
	-webkit-app-region: drag;
`;

export default ProjectPane;
