import Button from '@beak/app/components/atoms/Button';
import { ipcNestService, ipcPreferencesService } from '@beak/app/lib/ipc';
import React, { useEffect, useState } from 'react';

import { ItemGroup, ItemLabel, ItemSpacer } from '../atoms/item';
import Pane from '../molecules/Pane';

const EngineeringPane: React.FunctionComponent = () => {
	const [environment, setEnvironment] = useState<string | undefined>(void 0);
	const [hasAuth, setHasAuth] = useState(false);

	useEffect(() => {
		ipcPreferencesService.getEnvironment().then(setEnvironment);
		ipcNestService.hasAuth().then(setHasAuth);
	}, []);

	return (
		<Pane title={'Shhh...'}>
			<ItemGroup>
				<ItemLabel>{'Environment:'}</ItemLabel>
				<select
					disabled={environment === void 0}
					value={environment}
					onChange={e => {
						setEnvironment(e.target.value);
						ipcPreferencesService.switchEnvironment(e.target.value);
					}}
				>
					<option value={'prod'}>{'Production'}</option>
					<option value={'nonprod'}>{'Non-production'}</option>
				</select>
			</ItemGroup>

			<ItemGroup>
				<ItemLabel>{'Actions:'}</ItemLabel>
				<Button onClick={() => ipcPreferencesService.resetConfig()}>
					{'Reset config & cache'}
				</Button>
				{hasAuth && (
					<React.Fragment>
						<ItemSpacer />
						<Button
							colour={'destructive'}
							onClick={() => ipcPreferencesService.signOut()}
						>
							{'Sign out'}
						</Button>
					</React.Fragment>
				)}
			</ItemGroup>
		</Pane>
	);
};

export default EngineeringPane;