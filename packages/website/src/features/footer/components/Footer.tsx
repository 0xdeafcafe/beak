import { SmallContainer } from '@beak/website/components/atoms/Container';
import React from 'react';
import styled from 'styled-components';

import FooterBrand from './organisms/FooterBrand';
import FooterLinks from './organisms/FooterLinks';

const Footer: React.FunctionComponent = () => (
	<FooterWrapper>
		<FooterContainer>
			<FooterBrand />
			<FooterLinks />
		</FooterContainer>
	</FooterWrapper>
);

const FooterWrapper = styled.footer`
	margin-top: 120px;
	background: ${p => p.theme.ui.background};
`;

const FooterContainer = styled(SmallContainer)`
	display: flex;
	padding: 90px 0;
	justify-content: space-between;
`;

export default Footer;
