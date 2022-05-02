import type { IpcMain } from 'electron';
import { NotificationConstructorOptions } from 'electron/main';

import { IpcServiceMain, IpcServiceRenderer, Listener, PartialIpcRenderer } from './ipc';

export const NotificationMessages = {
	SendNotification: 'send_notification',
};

export interface SendNotificationReq extends NotificationConstructorOptions { }

export class IpcNotificationServiceRenderer extends IpcServiceRenderer {
	constructor(ipc: PartialIpcRenderer) {
		super('notification', ipc);
	}

	async sendNotification(payload: SendNotificationReq) {
		return this.invoke(NotificationMessages.SendNotification, payload);
	}
}

export class IpcNotificationServiceMain extends IpcServiceMain {
	constructor(ipc: IpcMain) {
		super('notification', ipc);
	}

	registerSendNotification(fn: Listener<SendNotificationReq>) {
		this.registerListener(NotificationMessages.SendNotification, fn);
	}
}