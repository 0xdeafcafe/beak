import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { ReflexContainer, ReflexElement } from 'react-reflex';
import { loadRequestPreferences } from '@beak/app-beak/store/preferences/actions';
import { alertInsert, alertRemoveDependents } from '@beak/app-beak/store/project/actions';
import { useAppSelector } from '@beak/app-beak/store/redux';
import { ValidRequestNode } from '@beak/shared-common/types/beak-project';
import ksuid from '@cuvva/ksuid';
import styled from 'styled-components';

import ReflexSplitter from '../../../components/atoms/ReflexSplitter';
import SelectedNodeContext from '../contexts/selected-node';
import RequestOutput from './molecules/RequestOutput';
import Header from './organisms/Header';
import Modifiers from './organisms/Modifiers';

const allowedBodyVerbs = ['GET', 'HEAD', 'DELETE'];

const RequestPane: React.FC<React.PropsWithChildren<unknown>> = () => {
	const dispatch = useDispatch();
	const mounted = useRef(false);
	const { tree } = useAppSelector(s => s.global.project);
	const selectedTab = useAppSelector(s => s.features.tabs.selectedTab);
	const selectedNode = tree[selectedTab!] as ValidRequestNode;
	const preferences = useAppSelector(s => s.global.preferences.requests[selectedNode.id]);

	useEffect(() => {
		mounted.current = true;

		return () => {
			mounted.current = false;
		};
	}, []);

	useEffect(() => {
		dispatch(loadRequestPreferences({ id: selectedNode.id }));
	}, [selectedNode.id]);

	useEffect(() => {
		if (selectedNode.type !== 'request')
			return () => { /* */ };

		const info = selectedNode.info;
		const hasBody = info.body.type !== 'text' || info.body.payload !== '';

		if (allowedBodyVerbs.includes(info.verb.toUpperCase()) && hasBody) {
			dispatch(alertInsert({
				ident: ksuid.generate('alert').toString(),
				alert: {
					type: 'http_body_not_allowed',
					dependencies: {
						requestId: selectedNode.id,
					},
				},
			}));
		}

		return () => dispatch(alertRemoveDependents({ requestId: selectedNode.id }));
	}, [selectedNode.id, selectedNode.info]);

	// TODO(afr): Maybe some sort of purgatory state here
	if (!selectedTab)
		return <Container />;

	if (!preferences)
		return <Container />;

	// TODO(afr): Handle this state
	if (selectedTab && !selectedNode)
		return <span>{'TODO: id does not exist'}</span>;

	return (
		<SelectedNodeContext.Provider value={selectedNode}>
			<Container>
				<Header node={selectedNode} />
				{/* @ts-expect-error - Temporary Fix */}
				<ReflexContainer orientation={'horizontal'}>
					{/* @ts-expect-error - Temporary Fix */}
					<ReflexElement
						flex={8}
						minSize={400}
					>
						<Modifiers node={selectedNode} />
					</ReflexElement>

					<ReflexSplitter orientation={'horizontal'} />

					{/* @ts-expect-error - Temporary Fix */}
					<ReflexElement
						flex={2}
						minSize={150}
						style={{ overflowY: 'hidden' }}
					>
						<RequestOutput selectedNode={selectedNode} />
					</ReflexElement>
				</ReflexContainer>
			</Container>
		</SelectedNodeContext.Provider>
	);
};

const Container = styled.div`
	display: flex;
	flex-direction: column;

	height: 100%;
	width: 100%;

	background-color: ${props => props.theme.ui.surface};
`;

export default RequestPane;