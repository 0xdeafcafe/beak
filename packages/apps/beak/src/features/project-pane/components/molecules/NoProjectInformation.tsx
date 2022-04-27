import React from 'react';
import SidebarSectionCard from '@beak/app-beak/features/sidebar/components/SidebarSectionCard';
import styled from 'styled-components';

const NoProjectInformation: React.FC<React.PropsWithChildren<unknown>> = () => (
	<Container>
		<SidebarSectionCard>
			{'This project isn\'t tracked in Git'}
		</SidebarSectionCard>
	</Container>
);

const Container = styled.div`
	margin-bottom: 10px;
`;

export default NoProjectInformation;