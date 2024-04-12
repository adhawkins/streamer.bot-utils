export class EventHistory {
	getHistory(host, port, apiKey, numEvents, retries, filter) {
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
								filter: filter,
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
						try {
							const response = JSON.parse(event.data)
							resolve(response);
						} catch (e) {
							console.log(`Error: ${e}`)
						}
					}
				} else {
					reject("No websocket support");
				}
			}
		})
	}
}
