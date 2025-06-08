// import anime from 'https://unpkg.com/animejs@3.2.2/lib/anime.es.js';
import anime from 'https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.es.js'
import { StreamerBotEvents } from './../common/streamerBotEvents.js';
// import 'https://unpkg.com/howler@2.2.4/dist/howler.core.min.js';
import 'https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.core.min.js';
import { preloadImages } from '../common/preloadImages.js';
import { settings } from './settings.js';
import { AlertsEnabled } from '../common/alertsEnabled.js';
import { Logger } from '../common/logger.js';

preloadImages([
	settings.subImage,
	settings.resubImage,
	settings.giftSubImage,
	settings.giftBombImage,
	settings.followImage,
	settings.cheerImage,
	settings.raidImage,
	settings.hostImage,
]);

function flattenObject(object, prefix, ret = {}) {
	Object.keys(object).forEach(key => {
		const keyName = prefix ? `${prefix}_${key}` : key;
		if ((typeof object[key]) == 'object' && object[key] !== null) {
			flattenObject(object[key], keyName, ret);
		} else {
			const keyName = prefix ? `${prefix}_${key}` : key;

			ret[keyName] = object[key];
		}
	});

	return ret;
}

function replaceTokens(formatString, values) {
	const flattenedValues = flattenObject(values);
	let retString = formatString;

	Object.keys(flattenedValues).forEach(key => {
		if (key === 'user_name' || key === 'username') {
			const replaceString = `<span class="username">${flattenedValues[key]}</span>`;
			retString = retString.replace(`%${key}%`, replaceString);
		} else if (key === 'viewers') {
			const replaceString = `<span class="viewers">${flattenedValues.viewers}</span>`;
			retString = retString.replace(`%${key}%`, replaceString);
		} else {
			retString = retString.replace(`%${key}%`, flattenedValues[key]);
		}
	});

	return retString;
}

function stringToDom(input) {
	let div = document.createElement("div");
	div.innerHTML = input;
	return div.firstElementChild
}

function showAlert(avatar, text1, text2, image, sound) {
	if (settings.enableAlerts) {
		const template = `
			<div class="alertMessage" style="opacity: 0;">
				<div>
					<img class="alertImage" src="${image}">
				</div>
				<div class="bottomText">
					<img src="${avatar}" class="${settings.showAvatars ? "avatar" : "no-avatar"}">
					${text1}
				</div>
				<div class="bottomText">
					<span class="message">${text2}</span>
				</div>
			</div>
	    `

		const node = stringToDom(template);

		const alertBox = document.querySelector("#alert");

		alertBox.innerHTML = "";
		alertBox.appendChild(node);

		if (settings.playSound && sound) {
			let soundPlayer = new Howl({
				src: [sound],
				autoplay: true
			});
		}

		anime({
			targets: node,
			easing: "easeInOutQuad",
			duration: 400,

			opacity: 1,
		})

		// anime({
		// 	targets: '.alertImage',

		// 	easing: "easeInOutQuad",
		// 	duration: 5000,
		// 	rotateZ: 360,
		// })

		if (settings.shouldFade) {
			setTimeout(() => {
				anime({
					targets: node,
					easing: "easeInOutQuad",
					duration: 400,

					opacity: 0,

					complete: () => {
						node.remove();
					}
				})
			}, settings.fadeTime * 1000) //convert seconds to milliseconds
		}
	}
}

function handleHost(host) {
	logger.sendMessage(`handleHost: '${JSON.stringify(host)}`)

	if (settings.showHost) {
		let text = '';

		if (host.viewers) {
			text = replaceTokens(settings.hostViewersText, host);
		} else {
			text = replaceTokens(settings.hostText, host);
		}

		showAlert(host.user.avatar, text, "&nbsp;", settings.hostImage, settings.hostSound);
	}
}

function handleRaid(raid) {
	logger.sendMessage(`Raid from '${raid.user.name}' - viewers: ${raid.data.viewers}`);

	if (settings.showRaid) {
		const ignoredUser = settings.ignoreRaids.find(function (user) { return user.user.toLocaleUpperCase().localeCompare(raid.user.name.toLocaleUpperCase()) == 0; });

		console.log(ignoredUser);

		if (!ignoredUser || ignoredUser.minViewers <= raid.data.viewers) {
			let text = '';

			if (raid.data.viewers) {
				text = replaceTokens(settings.raidViewersText, raid);
			} else {
				text = replaceTokens(settings.raidText, raid);
			}

			showAlert(raid.user.avatar, text, "&nbsp;", settings.raidImage, settings.raidSound);
		} else {
			console.log(`Ignored raid from ${raid.user.name}, viewers ${raid.data.viewers} < ${ignoredUser.minViewers}`);
		}
	}
}

function handleFollow(follow) {
	logger.sendMessage(`Follow from '${follow.user.name}' - age: ${follow.user.account_age.as("hours")}, minimum: ${settings.followMinimumAccountAge.as("hours")}`);

	if (settings.showFollow) {
		if (!settings.followIgnoreUsers.find(function (user) { return user.toLocaleUpperCase().localeCompare(follow.user.name.toLocaleUpperCase()) == 0; })) {
			if (!settings.followMinimumAccountAge || follow.user.account_age > settings.followMinimumAccountAge) {
				let text = '';

				text = replaceTokens(settings.followText, follow);

				showAlert(follow.user.avatar, text, "&nbsp;", settings.followImage, settings.followSound);
			} else {
				logger.sendMessage(`Account '${follow.user.name}' is only ${follow.user.account_age.as("hours")} hours old`)
			}
		}
	}
}

function handleSub(sub) {
	logger.sendMessage(`Sub from '${sub.user.name}' - tier: ${sub.data.subTier}`);

	if (settings.showSub) {
		let text = '';

		if (sub.data.subTier) {
			text = replaceTokens(settings.subLevelText, sub);
		} else {
			text = replaceTokens(settings.subText, sub);
		}

		showAlert(sub.user.avatar, text, "&nbsp;", settings.subImage, settings.subSound);
	}
}

function handleGiftSub(gift) {
	logger.sendMessage(`Gift sub from '${gift.user.name}' to '${gift.data.recipient.name}' - tier: ${gift.data.subTier}`);

	if (settings.showGiftSub) {
		let text = '';

		if (gift.data.subTier) {
			text = replaceTokens(settings.giftLevelText, gift);
		} else {
			text = replaceTokens(settings.giftText, gift);
		}

		showAlert(gift.user.avatar, text, "&nbsp;", settings.subImage, settings.subSound);
	}
}

function handleResub(resub) {
	logger.sendMessage(`Resub from '${resub.user.name}' for ${resub.data.cumulativeMonths} months - '${resub.data.message}'`);

	if (settings.showResub) {
		let text = '';

		text = replaceTokens(settings.resubText, resub);

		let resubMessage = "&nbsp;"

		if (settings.showResubMessage && resub.data.message) {
			resubMessage = resub.data.message;
		}

		showAlert(resub.user.avatar, text, resubMessage, settings.subImage, settings.subSound);
	}
}

function handleCheer(cheer) {
	logger.sendMessage(`'${cheer.user.name}' has donated ${cheer.data.message.bits} bits - '${cheer.data.message.message}'`);

	if (settings.showCheer) {
		let text = '';

		text = replaceTokens(settings.cheerText, cheer);

		let cheerMessage = "&nbsp;";

		if (settings.showCheerMessage && cheer.data.message.message) {
			cheerMessage = cheer.data.message.message;
		}

		showAlert(cheer.user.avatar, text, cheerMessage, settings.cheerImage, settings.cheerSound);
	}
}

function onSubFunc(sub) {
	// console.log(`onSub: '${JSON.stringify(sub)}'`);

	handleSub(sub);
}

function onResubFunc(resub) {
	// console.log(`onResub: '${JSON.stringify(resub)}'`);

	handleResub(resub);
}

function onGiftSubFunc(giftSub) {
	// console.log(`onGiftSub: '${JSON.stringify(giftSub)}'`);

	handleGiftSub(giftSub);
}

function onGiftBombFunc(giftBomb) {
	// console.log(`onGiftBomb: '${JSON.stringify(giftBomb)}'`);

	handleGiftBomb(giftBomb);
}

function onFollowFunc(follow) {
	// console.log(`onFollow: '${JSON.stringify(follow)}'`);

	handleFollow(follow);
}

function onCheerFunc(cheer) {
	// console.log(`onCheer: '${JSON.stringify(cheer)}'`);

	handleCheer(cheer);
}

function onRaidFunc(raid) {
	// console.log(`onRaid: '${JSON.stringify(raid)}'`);

	handleRaid(raid);
}

function onHostFunc(host) {
	// console.log(`onHost: '${JSON.stringify(host)}'`);

	handleHost(host);
}

function onHypeTrainStartFunc(hypeTrainStart) {
	// console.log(`onHypeTrainStart: '${JSON.stringify(hypeTrainStart)}'`);

	handleHypeTrainStart(hypeTrainStart);
}

function onHypeTrainLevelUpFunc(hypeTrainLevelUp) {
	// console.log(`onHypeTrainLevelUp: '${JSON.stringify(hypeTrainLevelUp)}'`);

	handleHypeTrainLevelUp(hypeTrainLevelUp);
}

function onHypeTrainEndFunc(hypeTrainEnd) {
	// console.log(`onHypeTrainEnd: '${JSON.stringify(hypeTrainEnd)}'`);

	handleHypeTrainEnd(hypeTrainEnd);
}

function onCustomEventFunc(customEvent) {
	// console.log(`onCustomEventFunc: '${JSON.stringify(customEvent)}'`);

	if (customEvent.Type == "AlertsEnabled") {
		settings.enableAlerts = Boolean(customEvent.AlertsEnabled);

		console.log(`Alerts enabled: '${settings.enableAlerts}'`);
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

if (settings.showHypeTrainStart) {
	streamerBotEvents.onHypeTrainStart(onHypeTrainStartFunc);
}

if (settings.showHypeTrainLevelUp) {
	streamerBotEvents.onHypeTrainLevelUp(onHypeTrainLevelUpFunc);
}

if (settings.showHypeTrainEnd) {
	streamerBotEvents.onHypeTrainEnd(onHypeTrainEndFunc);

}

streamerBotEvents.onCustomEvent(onCustomEventFunc);

const eventsEnabled = new AlertsEnabled();
eventsEnabled.getEnabled(settings.sbHost, settings.sbEnableDisablePort, 10)
	.then(function (enabled) {
		console.log(`Enabled: ${enabled}`);
		settings.enableAlerts = enabled;
	})
	.catch(function (error) {
		console.log(`Enabled error: '${error}'`);
	});

const logger = new Logger("twitch-endpoint.gently.org.uk", 443, "alerts");
