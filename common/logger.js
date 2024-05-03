import { DateTime } from 'https://cdn.jsdelivr.net/npm/luxon@3.4.4/+esm';

export class Logger {
	static maxQueue = 100;

	constructor(host, port, app) {
		this.host = host;
		this.port = port;
		this.app = app;
		this.ws = null;
		this.messages = [];

		this.connectWS();
	}

	connectWS() {
		if ("WebSocket" in window) {
			this.ws = new WebSocket(`wss://${this.host}:${this.port}/websocket-logger`);

			this.ws.onopen = function () {
				this.sendMessages();
			}.bind(this);

			this.ws.onclose = function () {
				setTimeout(function () { this.connectWS() }.bind(this), 1000);
			}.bind(this);
		} else {
			console.log("No websocket support");
		}
	}

	sendMessage(message) {
		const messageData = {
			message: {
				timestamp: DateTime.now().toFormat("yyyy-LL-dd HH:mm:ss"),
				app: this.app,
				message: message,
			}
		};

		this.messages.push(messageData);

		while (this.messages.length > Logger.maxQueue) {
			this.messages.shift();
		}

		this.sendMessages();
	}

	sendMessages() {
		if (this.ws.readyState == WebSocket.OPEN) {
			while (this.messages.length) {
				this.ws.send(JSON.stringify(this.messages.shift()));
			}
		}
	}
}
