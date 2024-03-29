export class AlertsEnabled {
	getEnabled(host, port, retries) {
		return new Promise(function (resolve, reject) {
			let attempts = 0;

			connectWS();

			function connectWS() {
				if ("WebSocket" in window) {
					const ws = new WebSocket(`ws://${host}:${port}/`);

					ws.onclose = function () {
						++attempts;

						console.log(`Attempt ${attempts} of ${retries}`)
						if (attempts < retries) {
							setTimeout(function () { connectWS() }, 1000);
						} else {
							reject("Too many retries");
						}
					};

					ws.onmessage = function (event) {
						console.log(event.data);
						const data = JSON.parse(event.data);

						if ("AlertsEnabled" in data && "Type" in data && data.Type == "AlertsEnabled") {
							resolve(data.AlertsEnabled);
						} else {
							reject(`Unexpected data: '${event.data}'`);
						}
					}
				} else {
					reject("No websocket support");
				}
			}
		})
	}
}
