export class EventHistory {
	getHistory(host, port, apiKey, numEvents, retries) {
		let attempts = 0;

		return new Promise(function (resolve, reject) {
			connectWS();

			function connectWS() {
				if ("WebSocket" in window) {
					const ws = new WebSocket(`wss://${host}:${port}/websocket`);

					ws.onopen = function () {
						const historyRequest = {
							history: {
								apikey: apiKey,
								numevents: numEvents,
							}
						}

						ws.send(JSON.stringify(historyRequest));
					}.bind(this);

					ws.onclose = function () {
						++attempts;

						console.log(`Attempt: ${attempts}, retries: ${retries}`)

						if (attempts <= retries) {
							setTimeout(function () { connectWS() }, 10000);
						} else {
							reject("Too many retries");
						}
					}.bind(this);

					ws.onmessage = function (event) {
						console.log(event.data);
						resolve(JSON.parse(event.data));
					}
				} else {
					reject("No websocket support");
				}
			}
		})
	}
}
