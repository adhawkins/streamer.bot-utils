import { UserLookup } from './userLookup.js';

export class StreamerBotEvents {
	constructor(host, port) {
		this.host = host;
		this.port = port;

		this.ws = null;

		this.lookup = new UserLookup()

		this.onResubFunc = null;
		this.onGiftSubFunc = null;
		this.onGiftBombFunc = null;
		this.onFollowFunc = null;
		this.onCheerFunc = null;
		this.onRaidFunc = null;
		this.onHostFunc = null;
		this.onHypeTrainStartFunc = null;
		this.onHypeTrainLevelUpFunc = null;
		this.onHypeTrainEndFunc = null;
		this.onCustomEventFunc = null;

		this.connectWS();
	}

	connectWS() {
		if ("WebSocket" in window) {
			this.ws = new WebSocket(`ws://${this.host}:${this.port}/`);

			this.ws.onopen = function () {
				console.log("Streamerbot websocket connected");

				this.requestEvents();
			}.bind(this);

			this.ws.onclose = function () {
				// "connectws" is the function we defined previously
				setTimeout(function () { this.connectWS() }.bind(this), 10000);
			}.bind(this);

			this.ws.onmessage = async function (event) {
				// grab message and parse JSON
				const msg = event.data;
				const wsdata = JSON.parse(msg);
				var textToAdd = "<h1>";
				console.log(wsdata);
				if ('event' in wsdata) {
					// check for events to trigger
					if (wsdata.event.source == 'Twitch') {
						if (wsdata.event.type == 'Sub') {
							await this.doCallback(this.onSubFunc, wsdata.data.userId, wsdata);
						} else if (wsdata.event.type == 'ReSub') {
							await this.doCallback(this.onResubFunc, wsdata.data.userId, wsdata);
						} else if (wsdata.event.type == 'GiftSub') {
							await this.doCallback(this.onGiftSubFunc, wsdata.data.userId, wsdata);
						} else if (wsdata.event.type == 'GiftBomb') {
							await this.doCallback(this.onGiftBombFunc, wsdata.data.userId, wsdata);
						} else if (wsdata.event.type == 'Follow') {
							await this.doCallback(this.onFollowFunc, wsdata.data.user_id, wsdata);
						} else if (wsdata.event.type == 'Cheer') {
							await this.doCallback(this.onCheerFunc, wsdata.data.message.userId, wsdata);
						} else if (wsdata.event.type == 'Raid') {
							await this.doCallback(this.onRaidFunc, wsdata.data.from_broadcaster_user_id, wsdata);
						} else if (wsdata.event.type == 'Host') {
							await this.doCallback(this.onHostFunc, wsdata.data.user_id, wsdata);
						} else if (wsdata.event.type == 'HypeTrainStart') {
							await this.doCallback(this.onHypeTrainStartFunc, wsdata.data.last_contribution.user_id, wsdata);
						} else if (wsdata.event.type == 'HypeTrainLevelUp') {
							await this.doCallback(this.onHypeTrainLevelUpFunc, wsdata.data.last_contribution.user_id, wsdata);
						} else if (wsdata.event.type == 'HypeTrainEnd') {
							await this.doCallback(this.onHypeTrainEndFunc, wsdata.data.top_contributions[0].user_id, wsdata);
						}
					} else if (wsdata.event.source == 'General') {
						if (wsdata.event.type == 'Custom') {
							console.log(`Custom event: '${JSON.stringify(wsdata.data)}'`);
							if (this.onCustomEventFunc) {
								await this.onCustomEventFunc(wsdata.data);
							}
						}
					}
				}
			}.bind(this);
		}
	}

	requestEvents() {
		if (this.ws.readyState == 1) {
			// const getEvents = {
			// 	"request": "GetEvents",
			// 	"id": "getevents"
			// };
			// this.ws.send(JSON.stringify(getEvents));

			const subEvents = {
				request: "Subscribe",
				id: "subscribe",
				events: {
					Twitch: [],
					General: [],
				}
			}

			if (this.onFollowFunc) {
				subEvents.events.Twitch.push("Follow");
			}

			if (this.onCheerFunc) {
				subEvents.events.Twitch.push("Cheer");
			}

			if (this.onSubFunc) {
				subEvents.events.Twitch.push("Sub");
			}

			if (this.onResubFunc) {
				subEvents.events.Twitch.push("Resub");
			}

			if (this.onGiftSubFunc) {
				subEvents.events.Twitch.push("GiftSub");
			}

			if (this.onGiftBombFunc) {
				subEvents.events.Twitch.push("GiftBomb");
			}

			if (this.onRaidFunc) {
				subEvents.events.Twitch.push("Raid");
			}

			if (this.onHostFunc) {
				subEvents.events.Twitch.push("Host");
			}

			if (this.onHypeTrainStartFunc) {
				subEvents.events.Twitch.push("HypeTrainStart");
			}

			if (this.onHypeTrainLevelUpFunc) {
				subEvents.events.Twitch.push("HypeTrainLevelUp");
			}

			if (this.onHypeTrainEndFunc) {
				subEvents.events.Twitch.push("HypeTrainEnd");
			}

			if (this.onCustomEventFunc) {
				subEvents.events.General.push("Custom");
			}

			this.ws.send(JSON.stringify(subEvents));
		}
	}

	async doCallback(callbackFunc, userID, wsData) {
		if (callbackFunc) {
			const lookupUser = await this.lookup.lookupUserByID(userID);
			if (lookupUser) {
				const callbackData = {
					user: {
						id: userID,
						name: lookupUser.name,
						display_name: lookupUser.displayName,
						avatar: lookupUser.profilePictureUrl,
						account_age: lookupUser.account_age,
					},
					data: wsData.data,
				};

				callbackFunc(callbackData);
			}
		}

	}

	onSub(onSubFunc) {
		this.onSubFunc = onSubFunc;

		this.requestEvents();
	}

	onResub(onResubFunc) {
		this.onResubFunc = onResubFunc;

		this.requestEvents();
	}

	onGiftSub(onGiftSubFunc) {
		this.onGiftSubFunc = onGiftSubFunc;

		this.requestEvents();
	}

	onGiftBomb(onGiftBombFunc) {
		this.onGiftBombFunc = onGiftBombFunc;

		this.requestEvents();
	}

	onFollow(onFollowFunc) {
		this.onFollowFunc = onFollowFunc;

		this.requestEvents();
	}

	onCheer(onCheerFunc) {
		this.onCheerFunc = onCheerFunc;

		this.requestEvents();
	}

	onRaid(onRaidFunc) {
		this.onRaidFunc = onRaidFunc;

		this.requestEvents();
	}

	onHost(onHostFunc) {
		this.onHostFunc = onHostFunc;

		this.requestEvents();
	}

	onHypeTrainStart(onHypeTrainStartFunc) {
		this.onHypeTrainStartFunc = onHypeTrainStartFunc;

		this.requestEvents();
	}

	onHypeTrainLevelUp(onHypeTrainLevelUpFunc) {
		this.onHypeTrainLevelUpFunc = onHypeTrainLevelUpFunc;

		this.requestEvents();
	}

	onHypeTrainEnd(onHypeTrainEndFunc) {
		this.onHypeTrainEndFunc = onHypeTrainEndFunc;

		this.requestEvents();
	}

	onCustomEvent(onCustomEventFunc) {
		this.onCustomEventFunc = onCustomEventFunc;

		this.requestEvents();
	}
}
