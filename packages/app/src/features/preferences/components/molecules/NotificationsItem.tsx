import React, { useEffect, useState } from 'react';
import Checkbox from '@beak/app/components/atoms/Checkbox';
import { ipcPreferencesService } from '@beak/app/lib/ipc';
import { NotificationPreferences, NotificationState } from '@beak/common/types/preferences';
import styled from 'styled-components';

import { ItemGroup, ItemLabel } from '../atoms/item';
import NotificationStateSelect from '../atoms/NotificationStateSelect';

const NotificationsItem: React.FC<React.PropsWithChildren<unknown>> = () => {
	const [onSuccessfulRequest, setOnSuccessfulRequest] = useState<NotificationState>();
	const [onInformationRequest, setOnInformationRequest] = useState<NotificationState>();
	const [onFailedRequest, setOnFailedRequest] = useState<NotificationState>();
	const [showRequestNotificationWhenFocused, setShowRequestNotificationWhenFocused] = useState<boolean>();
	const [onUpdateAvailable, setOnUpdateAvailable] = useState<NotificationState>();

	useEffect(() => {
		ipcPreferencesService.getNotificationValue('onSuccessfulRequest').then(setOnSuccessfulRequest);
		ipcPreferencesService.getNotificationValue('onInformationRequest').then(setOnInformationRequest);
		ipcPreferencesService.getNotificationValue('onFailedRequest').then(setOnFailedRequest);
		ipcPreferencesService.getNotificationValue('showRequestNotificationWhenFocused').then(setShowRequestNotificationWhenFocused);
		ipcPreferencesService.getNotificationValue('onUpdateAvailable').then(setOnUpdateAvailable);
	}, []);

	// eslint-disable-next-line max-len
	function setNotificationValue<Key extends keyof NotificationPreferences>(key: Key, value: NotificationPreferences[Key]) {
		ipcPreferencesService.setNotificationValue(key, value);
	}

	if (!onSuccessfulRequest || !onInformationRequest || !onFailedRequest || !onUpdateAvailable)
		return null;

	return (
		<ItemGroup>
			<ItemLabel>{'Notifications:'}</ItemLabel>

			<SubItemGroup>
				<SubItem>
					<SubItemLabel>{'Successful requests: '}</SubItemLabel>
					<NotificationStateSelect
						value={onSuccessfulRequest}
						onChange={value => {
							setOnSuccessfulRequest(value);
							setNotificationValue('onSuccessfulRequest', value);
						}}
					/>
				</SubItem>
				<SubItem>
					<SubItemLabel>{'Information requests: '}</SubItemLabel>
					<NotificationStateSelect
						value={onInformationRequest}
						onChange={value => {
							setOnInformationRequest(value);
							setNotificationValue('onInformationRequest', value);
						}}
					/>
				</SubItem>
				<SubItem>
					<SubItemLabel>{'Failed requests: '}</SubItemLabel>
					<NotificationStateSelect
						value={onFailedRequest}
						onChange={value => {
							setOnFailedRequest(value);
							setNotificationValue('onFailedRequest', value);
						}}
					/>
				</SubItem>
				<SubItem>
					<SubItemLabel>{'Update available: '}</SubItemLabel>
					<NotificationStateSelect
						value={onUpdateAvailable}
						onChange={value => {
							setOnUpdateAvailable(value);
							setNotificationValue('onUpdateAvailable', value);
						}}
					/>
				</SubItem>
				<SubItem>
					<Checkbox
						id={'showRequestNotificationWhenFocused'}
						checked={showRequestNotificationWhenFocused}
						label={'Show notification banners when Beak has focus'}
						onChange={event => {
							setShowRequestNotificationWhenFocused(event.currentTarget.checked);
							setNotificationValue('showRequestNotificationWhenFocused', event.currentTarget.checked);
						}}
					/>
				</SubItem>
			</SubItemGroup>
		</ItemGroup>
	);
};

const SubItemGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	font-size: 14px;
`;
const SubItem = styled.div`
	font-size: 12px;
	color: ${p => p.theme.ui.textMinor};
`;
const SubItemLabel = styled.div`
	margin-bottom: 3px;
`;

export default NotificationsItem;
