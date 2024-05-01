import { ApiClient } from 'https://cdn.jsdelivr.net/npm/@twurple/api@7.0.10/+esm';
import { AppTokenAuthProvider } from 'https://cdn.jsdelivr.net/npm/@twurple/auth@7.0.10/+esm';
import { DateTime } from 'https://cdn.jsdelivr.net/npm/luxon@3.4.4/+esm';

const TWITCH_CLIENTID = 'ppkkiyvm3zggq3viigxg3h826ji9jw';
const TWITCH_CLIENTSECRET = '1kalqmbkl7nag6shtefrxathzbxnz6';

class TwitchUser {
	constructor(user) {
		this.timestamp = new Date().getTime();
		this.user = user;
		this.user.account_age = DateTime.now().diff(DateTime.fromJSDate(user.creationDate));
	}

	isExpired() {
		const now = new Date().getTime();
		const diff = now - this.timestamp;

		return diff > 10000;
	}
}

export class UserLookup {
	constructor() {
		this.userMap = new Map();
		this.authProvider = new AppTokenAuthProvider(TWITCH_CLIENTID, TWITCH_CLIENTSECRET);
		const authProvider = this.authProvider;
		this.twitchAPI = new ApiClient({ authProvider: this.authProvider });
	}

	async lookupUserByID(userID) {
		// console.log(`Looking up user: '${userID}'`);

		if (!this.userMap.has(userID) || this.userMap.get(userID).isExpired()) {
			const user = await this.twitchAPI.users.getUserById(userID);

			if (user) {
				this.userMap.set(user.id, new TwitchUser(user));
			}
		}

		return this.userMap.get(userID) ? this.userMap.get(userID).user : null;
	}

	async lookupUserByName(userName) {
		// console.log(`Looking up user: '${userName}'`);

		const user = await this.twitchAPI.users.getUserByName(userName);

		if (user) {
			this.userMap.set(user.id, new TwitchUser(user));
			return this.userMap.get(user.id).user;
		}

		return null;
	}
}

