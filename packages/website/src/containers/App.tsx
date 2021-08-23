import React from 'react';

import Container from '../components/atoms/Container';
import Footer from '../components/atoms/Footer';
import FooterLogo from '../components/atoms/FooterLogo';
import Navbar, { NavBrand, NavItem, NavItems, NavLogo } from '../components/atoms/Navbar';
import useSmoothHashScroll from '../hooks/use-smooth-hash-scroll';

const AppContainer: React.FunctionComponent = ({ children }) => {
	useSmoothHashScroll();

	return (
		<React.Fragment>
			<Navbar>
				<Container>
					<NavBrand>
						<NavLogo />
						{'Beak'}
					</NavBrand>
					<NavItems>
						<NavItem to={'#features'}>
							{'Features'}
						</NavItem>
						{/* <NavItem to={'/pricing'}>
							{'Pricing'}
						</NavItem> */}
						<NavItem
							target={'_blank'}
							rel={'noopener noreferrer nofollow'}
							to={'https://docs.getbeak.app'}
						>
							{'Docs'}
						</NavItem>
						<NavItem
							target={'_blank'}
							rel={'noopener noreferrer nofollow'}
							to={'https://blog.getbeak.app'}
						>
							{'Blog'}
						</NavItem>
						<NavItem
							target={'_blank'}
							rel={'noopener noreferrer nofollow'}
							to={'https://twitter.com/beakapp'}
						>
							{'Twitter'}
						</NavItem>
					</NavItems>
				</Container>
			</Navbar>

			{children}

			<Footer>
				<Container>
					<span>{'Made with ❤️ in the UK'}</span>
					<FooterLogo />
				</Container>
			</Footer>
		</React.Fragment>
	);
}

export default AppContainer;
