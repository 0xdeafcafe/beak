import FooterLogo from '@beak/website/components/atoms/FooterLogo';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const FooterLinks: React.FunctionComponent = () => (
	<LinkContainer>
		<LinkColumn>
			<LinkHeader>{'Beak'}</LinkHeader>
			<LinkItem to={'/#features'}>{'Features'}</LinkItem>
			<LinkItem to={'/pricing'}>{'Pricing'}</LinkItem>
			<ExternalLinkItem
				target={'_blank'}
				rel={'noopener noreferrer nofollow'}
				href={'https://docs.getbeak.app/'}
			>
				{'Docs'}
			</ExternalLinkItem>
		</LinkColumn>

		<LinkColumn>
			<LinkHeader>{'Fun legals'}</LinkHeader>
			<LinkItem to={'/legal/terms'}>{'Terms'}</LinkItem>
			<LinkItem to={'/legal/privacy'}>{'Privacy'}</LinkItem>
		</LinkColumn>

		<LinkColumn>
			<LinkHeader>{'Contact'}</LinkHeader>
			<ExternalLinkItem
				target={'_blank'}
				rel={'noopener noreferrer nofollow'}
				href={'mailto:info@getbeak.app'}
			>
				{'Email'}
			</ExternalLinkItem>
			<ExternalLinkItem
				target={'_blank'}
				rel={'noopener noreferrer nofollow'}
				href={'https://twitter.com/getbeak'}
			>
				{'Twitter'}
			</ExternalLinkItem>
		</LinkColumn>
	</LinkContainer>
);

const LinkContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 50px;
`;

const LinkColumn = styled.div``;

const LinkHeader = styled.div`
	font-size: 18px;
	font-weight: 600;
	margin-bottom: 10px;
`;

const LinkItem = styled(Link)`
	display: block;
	font-size: 14px;
	line-height: 25px;
	text-decoration: none;
	color: ${p => p.theme.ui.textMinor};

	&:hover {
		text-decoration: underline;
	}
`;

const ExternalLinkItem = styled.a`
	display: block;
	font-size: 14px;
	line-height: 25px;
	text-decoration: none;
	color: ${p => p.theme.ui.textMinor};

	&:hover {
		text-decoration: underline;
	}
`;

export default FooterLinks;
