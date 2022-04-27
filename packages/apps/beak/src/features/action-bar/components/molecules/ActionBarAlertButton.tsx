import React, { useRef, useState } from 'react';
import { useAppSelector } from '@beak/app-beak/store/redux';
import { TypedObject } from '@beak/shared-common/helpers/typescript';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from 'styled-components';

import ActionBarButton from '../atoms/ActionBarButton';
import AlertsPopover from '../organisms/AlertsPopover';

const ActionBarAlertButton: React.FC<React.PropsWithChildren<unknown>> = () => {
	const theme = useTheme();
	const [showPopover, setShowPopover] = useState(false);
	const alerts = useAppSelector(s => s.global.project.alerts);
	const hasAlerts = TypedObject.values(alerts).filter(Boolean).length > 0;
	const parentRef = useRef() as React.MutableRefObject<HTMLButtonElement>;

	if (!hasAlerts)
		return null;

	return (
		<React.Fragment>
			<ActionBarButton ref={parentRef}>
				<FontAwesomeIcon
					color={hasAlerts ? 'orange' : theme.ui.textMinor}
					size={'1x'}
					icon={faExclamationTriangle}
					onClick={() => setShowPopover(true)}
				/>
			</ActionBarButton>

			{parentRef.current && showPopover && (
				<AlertsPopover
					parent={parentRef.current}
					onClose={() => setShowPopover(false)}
				/>
			)}
		</React.Fragment>
	);
};

export default ActionBarAlertButton;