// import anime from 'https://unpkg.com/animejs@3.2.2/lib/anime.es.js';
import anime from 'https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.es.js'
import { StreamerBotEvents } from './../common/streamerBotEvents.js';
import { preloadImages } from './../common/preloadImages.js';
import { EventHistory } from '../common/eventHistory.js';
import { settings } from './settings.js';
import { AlertsEnabled } from '../common/alertsEnabled.js';

const margin = 5;
let fadeOutTimeout = null;
let fadeOut = null;

preloadImages([
	settings.backgroundImage,
]);

function stringToDom(input) {
	let div = document.createElement("div");
	div.innerHTML = input;
	return div.firstElementChild
}

async function displayEvent(user, message) {
	if (settings.enableEvents) {
		const eventList = document.querySelector(".eventList");

		const template = `
			<div class="eventItem" style="opacity: 0;">
				<div class="username">${user}</div>
				<div class="message">${message}</div>
			</div>
		`

		const node = stringToDom(template);

		eventList.prepend(node)

		if (fadeOutTimeout) {
			clearTimeout(fadeOutTimeout);
			fadeOutTimeout = null;
		}

		if (fadeOut) {
			anime.remove(fadeOut);
			fadeOut = null;
		}

		anime({
			targets: eventList,
			easing: "easeInOutQuad",
			duration: 400,
			opacity: 1,
		});

		//get the computed height of the node
		let { nodeHeight } = node.getBoundingClientRect();
		//node.style.height="0px";

		//move the entire container up by that amount, accounting for any margin you might have on the items;
		eventList.style.transform = `translateY(-${nodeHeight + (margin * 2)}px)`

		//animate the container down.

		anime({
			targets: eventList,
			translateY: 0,
			duration: 400,
			easing: "easeInOutQuad"
		});

		//animate the new item to be opaque.

		await anime({
			targets: node,
			opacity: 1,
			duration: 1000,
			easing: "easeInOutQuad"
		}).finished;

		while (eventList.children.length > settings.maxEvents) {
			let item = eventList.children[eventList.children.length - 1];

			//animate the item we're removing to be transparent

			await anime({
				targets: item,
				opacity: 0,
				height: 0,
				duration: 400,
				easing: "easeInOutQuad",
			}).finished;

			eventList.removeChild(item);
		}

		if (settings.shouldFade) {
			fadeOutTimeout = setTimeout(() => {
				fadeOut = anime({
					targets: eventList,
					easing: "easeInOutQuad",
					duration: 400,
					opacity: 0,
				});
			}, settings.fadeTime * 1000) //convert seconds to milliseconds
		}
	}
}

async function handleFollow(user) {
	if (settings.showFollow) {
		displayEvent(user, 'Follow');
	}
}

async function handleHost(user, viewers) {
	if (settings.showHost) {
		displayEvent(user, `Host ${viewers ? '(' + viewers + ')' : ''}`);
	}
}

async function handleRaid(user, viewers) {
	if (settings.showRaid) {
		displayEvent(user, `Raid ${viewers ? '(' + viewers + ')' : ''}`);
	}
}

async function handleCheer(user, amount, currency) {
	if (settings.showCheer) {
		displayEvent(user, `${amount} ${currency}`);
	}
}

async function handleSub(user, level) {
	if (settings.showSub) {
		displayEvent(user, `Sub ${level ? '(Tier ' + level + ')' : '(Prime)'}`);
	}
}

async function handleGiftSub(user, level) {
	if (settings.showGiftSub) {
		displayEvent(user, `Gift sub ${level ? '(Tier ' + level + ')' : ''}`);
	}
}

async function handleResub(user, months) {
	if (settings.showResub) {
		displayEvent(user, `Re-sub (x${months})`);
	}
}

function onCheerFunc(cheer) {
	handleCheer(cheer.user.display_name, cheer.data.message.bits, "bits")
}

function onFollowFunc(follow) {
	handleFollow(follow.user.display_name);
}

function onSubFunc(sub) {
	handleSub(sub.user.display_name, sub.data.subTier);
}

function onGiftSubFunc(sub) {
	handleGiftSub(sub.user.display_name, sub.data.subTier);
}

function onGiftBombFunc(sub) {
	handleGiftBomb(sub.user.display_name, sub.level);
}

function onResubFunc(sub) {
	handleResub(sub.user.display_name, sub.data.cumulativeMonths);
}

function onRaidFunc(raid) {
	handleRaid(raid.user.display_name, raid.data.viewers);
}

function onHostFunc(host) {
	handleHost(host.user.display_name, host.data.viewers);
}

function onCustomEventFunc(customEvent) {
	// console.log(`onCustomEventFunc: '${JSON.stringify(customEvent)}'`);

	if (customEvent.Type == "AlertsEnabled") {
		settings.enableEvents = Boolean(customEvent.AlertsEnabled);

		console.log(`Alerts enabled: '${settings.enableEvents}'`);
	}
}


const streamerBotEvents = new StreamerBotEvents(settings.sbHost, settings.sbMainPort);

if (settings.showSub) {
	streamerBotEvents.onSub(onSubFunc);
}

if (settings.showResub) {
	streamerBotEvents.onResub(onResubFunc);
}

if (settings.showGiftSub) {
	streamerBotEvents.onGiftSub(onGiftSubFunc);
}

if (settings.showGiftBomb) {
	streamerBotEvents.onGiftBomb(onGiftBombFunc);
}

if (settings.showFollow) {
	streamerBotEvents.onFollow(onFollowFunc);
}

if (settings.showCheer) {
	streamerBotEvents.onCheer(onCheerFunc);
}

if (settings.showRaid) {
	streamerBotEvents.onRaid(onRaidFunc);
}

if (settings.showHost) {
	streamerBotEvents.onHost(onHostFunc);
}

// if (settings.showHypeTrainStart) {
// 	streamerBotEvents.onHypeTrainStart(onHypeTrainStartFunc);
// }

// if (settings.showHypeTrainLevelUp) {
// 	streamerBotEvents.onHypeTrainLevelUp(onHypeTrainLevelUpFunc);
// }

// if (settings.showHypeTrainEnd) {
// 	streamerBotEvents.onHypeTrainEnd(onHypeTrainEndFunc);
// }

streamerBotEvents.onCustomEvent(onCustomEventFunc);

async function getHistory() {
	const eventList = document.querySelector(".eventList");

	while (eventList.children.length) {
		eventList.removeChild(eventList.children[eventList.children.length - 1]);
	}

	const eventHistory = new EventHistory();
	const historicEvents = await eventHistory.getHistory(settings.historyAddress, settings.historyPort, settings.historyAPIKey, settings.maxEvents, 5, settings.eventFilter);

	historicEvents.reverse().forEach(async function (event) {
		console.log(event);

		switch (event.type) {
			case "EventType.Bits":
				handleCheer(event.name, event.amount, "bits");
				break;

			case "EventType.Follow":
				handleFollow(event.name);
				break;

			case "EventType.Sub":
				handleSub(event.name, event.tier);
				break;

			case "EventType.GiftSub":
				handleGiftSub(event.name, event.tier);
				break;

			case "EventType.Resub":
				handleResub(event.name, event.months);
				break;

			case "EventType.Raid":
				handleRaid(event.name, event.viewers);
				break;

			case "EventType.Redemption":
				break;

		}
	});
}

const eventsEnabled = new AlertsEnabled();
eventsEnabled.getEnabled(settings.sbHost, settings.sbEnableDisablePort, 10)
	.then(function (enabled) {
		console.log(`Enabled: ${enabled}`);
		settings.enableEvents = enabled;
		getHistory();
	})
	.catch(function (error) {
		console.log(`Enabled error: '${error}'`);
		getHistory();
	});
