import React from 'react';
import { TypedObject } from '@beak/common/helpers/typescript';
import Kbd from '@beak/ui/components/atoms/Kbd';
import shortcutDefinitions, { Shortcuts } from '@beak/ui/lib/keyboard-shortcuts';
import { PlatformAgnosticDefinitions, PlatformSpecificDefinitions, ShortcutDefinition } from '@beak/ui/lib/keyboard-shortcuts/types';
import { renderSimpleKey } from '@beak/ui/utils/keyboard-rendering';
import styled from 'styled-components';

const displayShortcuts: Partial<Record<Shortcuts, string>> = {
	'menu-bar.file.new-request': 'Create new request',
	'global.execute-request': 'Execute request',
	'omni-bar.launch.commands': 'Open command bar',
	'omni-bar.launch.finder': 'Open finder bar',
	'sidebar.toggle-view': 'Toggle sidebar',
};

const PendingSlash: React.FC<React.PropsWithChildren<unknown>> = () => (
	<Wrapper>
		<FadedLogo />
		<ShortcutContainer>
			{TypedObject.keys(displayShortcuts).map(k => {
				const name = displayShortcuts[k];
				const definition = shortcutDefinition(shortcutDefinitions[k]);

				return (
					<SingleShortcut key={k}>
						<ShortcutName>{name}</ShortcutName>
						<NonCommandKeys>
							{Array.isArray(definition.key) && definition.key.map(k => (
								<React.Fragment key={k}>
									<CommandKeys definition={definition} />
									<Kbd>{renderSimpleKey(k)}</Kbd>
									<KbdOption>{'|'}</KbdOption>
								</React.Fragment>
							))}
							{typeof definition.key === 'string' && (
								<React.Fragment>
									<CommandKeys definition={definition} />
									<Kbd>{renderSimpleKey(definition.key)}</Kbd>
								</React.Fragment>
							)}
						</NonCommandKeys>
					</SingleShortcut>
				);
			})}
		</ShortcutContainer>
	</Wrapper>
);

const CommandKeys: React.FC<{ definition: ShortcutDefinition }> = ({ definition }) => (
	<>
		{definition.ctrlOrMeta && <Kbd>{'⌘'}</Kbd>}
		{definition.ctrl && <Kbd>{'⌃'}</Kbd>}
		{definition.alt && <Kbd>{'⌥'}</Kbd>}
		{definition.meta && <Kbd>{'⌘'}</Kbd>}
		{definition.shift && <Kbd>{'⇧'}</Kbd>}
	</>
);

function shortcutDefinition(definition: PlatformSpecificDefinitions | PlatformAgnosticDefinitions) {
	if (definition.type === 'agnostic')
		return definition;

	// return definition[windowSessionInstance.getPlatform()];
	return definition.darwin;
}

const Wrapper = styled.div`
	display: flex;
	width: 100%;
	height: 100%;

	align-items: center;
	justify-content: center;
	flex-direction: column;
`;

const FadedLogo = styled.div`
	width: 200px;
	height: 200px;
	background: url('images/logo-blank.png');
	background-repeat: no-repeat;
	background-position: center;
	background-size: contain;
	opacity: ${p => p.theme.theme === 'light' ? 0.3 : 0.15};
`;

const ShortcutContainer = styled.div``;

const SingleShortcut = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 10px;
	margin-bottom: 10px;

	font-size: 12px;
	line-height: 11px;
	color: ${p => p.theme.ui.textMinor};
`;

const ShortcutName = styled.div`
	display: flex;
	align-items: center;
	justify-content: right;
`;

const NonCommandKeys = styled.div`
	display: inline-block;
`;

const KbdOption = styled.div`
	display: inline-block;
	content: '|';
	margin: 0 2px;

	&:last-child {
		display: none;
	}
`;

export default PendingSlash;
