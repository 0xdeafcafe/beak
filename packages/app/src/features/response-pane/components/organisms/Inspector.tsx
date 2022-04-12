import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestPreferenceSetResMainTab } from '@beak/app/store/preferences/actions';
import { ResponsePreferenceMainTab } from '@beak/common/types/beak-hub';
import styled from 'styled-components';

import TabBar from '../../../../components/atoms/TabBar';
import TabItem from '../../../../components/atoms/TabItem';
import TabSpacer from '../../../../components/atoms/TabSpacer';
import { Flight } from '../../../../store/flight/types';
import OverviewTab from './OverviewTab';
import RequestTab from './RequestTab';
import ResponseTab from './ResponseTab';

export interface InspectorProps {
	flight: Flight;
}

const Inspector: React.FunctionComponent<InspectorProps> = props => {
	const dispatch = useDispatch();
	// Don't need to fetch these as it's done by the request
	const preferences = useSelector(s => s.global.preferences.requests[props.flight.requestId].response);

	function setTab(tab: ResponsePreferenceMainTab) {
		dispatch(requestPreferenceSetResMainTab({ id: props.flight.requestId, tab }));
	}

	return (
		<React.Fragment>
			<TabBar centered>
				<TabSpacer />
				<TabItem
					active={preferences.mainTab === 'overview'}
					onClick={() => setTab('overview')}
				>
					{'Overview'}
				</TabItem>
				<TabItem
					active={preferences.mainTab === 'request'}
					onClick={() => setTab('request')}
				>
					{'Request'}
				</TabItem>
				<TabItem
					active={preferences.mainTab === 'response'}
					onClick={() => setTab('response')}
				>
					{'Response'}
				</TabItem>
				<TabSpacer />
			</TabBar>

			<TabBody>
				{preferences.mainTab === 'overview' && <OverviewTab flight={props.flight} />}
				{preferences.mainTab === 'request' && <RequestTab flight={props.flight} />}
				{preferences.mainTab === 'response' && <ResponseTab flight={props.flight} />}
			</TabBody>
		</React.Fragment>
	);
};

const TabBody = styled.div`
	flex-grow: 2;

	overflow-y: hidden;
`;

export default Inspector;
