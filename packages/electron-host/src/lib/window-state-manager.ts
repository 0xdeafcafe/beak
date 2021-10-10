import {
	BrowserWindow,
	BrowserWindowConstructorOptions,
	Rectangle,
	screen,
} from 'electron';

import persistentStore from './persistent-store';

export interface WindowState {
	width: number;
	height: number;
	x: number;
	y: number;

	isMaximized: boolean;
	isFullScreen: boolean;

	display: {
		id: number;
		bounds: Rectangle;
	};
}

export default class WindowStateManager {
	private windowKey: string;
	private window: BrowserWindow | undefined;
	private state: WindowState;
	private stateChangeTimer: NodeJS.Timeout | undefined;
	private windowOptions: BrowserWindowConstructorOptions;

	constructor(windowKey: string, windowOptions: BrowserWindowConstructorOptions) {
		const existingState = persistentStore.get('windowStates')[windowKey];

		this.windowKey = windowKey;
		this.windowOptions = windowOptions;

		if (existingState) {
			this.state = existingState;
		} else {
			const cursor = screen.getCursorScreenPoint();
			const display = screen.getDisplayNearestPoint(cursor);

			this.state = {
				height: windowOptions.height!,
				width: windowOptions.width!,
				x: 0,
				y: 0,
				isFullScreen: false,
				isMaximized: false,
				display: {
					id: display.id,
					bounds: display.bounds,
				},
			};
		}
	}

	attach(window: BrowserWindow) {
		this.window = window;

		this.ensureWindowBoundsAcceptable();

		if (this.state.isMaximized)
			this.window.maximize();
		else if (this.state.isFullScreen)
			this.window.setFullScreen(true);

		this.window.setPosition(this.state.x, this.state.y);

		if (this.windowOptions.resizable)
			this.window.setSize(this.state.width, this.state.height);

		this.window.on('resize', () => this.stateChangedHandler());
		this.window.on('move', () => this.stateChangedHandler());
		this.window.on('close', () => this.closeHandler());
		this.window.on('closed', () => this.closedHandler());
	}

	detach() {
		if (!this.window)
			return;

		if (this.stateChangeTimer)
			global.clearTimeout(this.stateChangeTimer);
	}

	private stateChangedHandler() {
		if (this.stateChangeTimer)
			global.clearTimeout(this.stateChangeTimer);

		this.stateChangeTimer = setTimeout(() => this.updateState(), 100);
	}

	private closeHandler() {
		this.updateState();
	}

	private closedHandler() {
		this.detach();
		this.saveState();
	}

	private updateState() {
		if (!this.window)
			return;

		const bounds = this.window.getBounds();
		const display = screen.getDisplayMatching(bounds);

		if (this.isWindowNormal()) {
			this.state.height = bounds.height;
			this.state.width = bounds.width;
			this.state.x = bounds.x;
			this.state.y = bounds.y;
		}

		this.state.isMaximized = this.window.isMaximized();
		this.state.isFullScreen = this.window.isFullScreen();
		this.state.display = {
			id: display.id,
			bounds: display.bounds,
		};
	}

	private isWindowNormal() {
		if (!this.window)
			return true;

		return !this.window.isMaximized() && !this.window.isMinimized() && !this.window.isFullScreen();
	}

	private saveState() {
		const windowStates = persistentStore.get('windowStates');

		windowStates[this.windowKey] = this.state;
		persistentStore.set('windowStates', windowStates);

		this.window = void 0;
	}

	private windowWithinBounds(bounds: Rectangle) {
		/* eslint-disable operator-linebreak */
		return (
			this.state.x >= bounds.x &&
			this.state.y >= bounds.y &&
			this.state.x + this.state.width <= bounds.x + bounds.width &&
			this.state.y + this.state.height <= bounds.y + bounds.height
		);
		/* eslint-enable operator-linebreak */
	}

	private ensureWindowBoundsAcceptable() {
		const visible = screen.getAllDisplays().some(display => this.windowWithinBounds(display.bounds));

		if (!visible) {
			this.state.x = 0;
			this.state.y = 0;
			this.state.display = {
				id: screen.getPrimaryDisplay().id,
				bounds: screen.getPrimaryDisplay().bounds,
			};
		}
	}
}
