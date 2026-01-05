const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "wl",
		version: "1.1",
		author: "ArYAN",
		countDown: 5,
		role: 2,
		description: {
			en: "Add, remove, edit whiteListIds"
		},
		category: "ADMIN",
		guide: {
			en: '   {pn} [add | -a] <uid | @tag>: Add user to whiteList'
				+ '\n     {pn} [remove | -r] <uid | @tag>: Remove user from whiteList'
				+ '\n     {pn} [list | -l]: List all users in whiteList'
				+ '\n     {pn} [on | off]: Enable/Disable whiteList mode'
		}
	},

	langs: {
		en: {
			added: "✅ | Added whiteList role for %1 users:\n%2",
			alreadyAdmin: "\n⚠️ | %1 users already have whiteList role:\n%2",
			missingIdAdd: "⚠️ | Please enter ID or tag user to add to whiteList",
			removed: "✅ | Removed whiteList role of %1 users:\n%2",
			notAdmin: "⚠️ | %1 users don't have whiteList role:\n%2",
			missingIdRemove: "⚠️ | Please enter ID or tag user to remove from whiteList",
			listAdmin: "👑 | List of whiteList IDs:\n%1",
			enable: "✅ | WhiteList mode has been turned ON",
			disable: "✅ | WhiteList mode has been turned OFF"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {
		switch (args[0]) {
			case "add":
			case "-a": {
				if (args[1]) {
					let uids = [];
					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions);
					else if (event.messageReply)
						uids.push(event.messageReply.senderID);
					else
						uids = args.filter(arg => !isNaN(arg));
					
					const notInWL = [];
					const alreadyInWL = [];
					for (const uid of uids) {
						if (config.whiteListMode.whiteListIds.includes(uid))
							alreadyInWL.push(uid);
						else
							notInWL.push(uid);
					}

					config.whiteListMode.whiteListIds.push(...notInWL);
					const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name: name || uid }))));
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
					
					return message.reply(
						(notInWL.length > 0 ? getLang("added", notInWL.length, getNames.filter(u => notInWL.includes(u.uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
						+ (alreadyInWL.length > 0 ? getLang("alreadyAdmin", alreadyInWL.length, alreadyInWL.map(uid => `• ${uid}`).join("\n")) : "")
					);
				}
				else
					return message.reply(getLang("missingIdAdd"));
			}
			case "remove":
			case "-r": {
				if (args[1]) {
					let uids = [];
					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions);
					else if (event.messageReply)
						uids.push(event.messageReply.senderID);
					else
						uids = args.filter(arg => !isNaN(arg));

					const inWL = [];
					const notInWL = [];
					for (const uid of uids) {
						if (config.whiteListMode.whiteListIds.includes(uid))
							inWL.push(uid);
						else
							notInWL.push(uid);
					}

					for (const uid of inWL)
						config.whiteListMode.whiteListIds.splice(config.whiteListMode.whiteListIds.indexOf(uid), 1);
					
					const getNames = await Promise.all(inWL.map(uid => usersData.getName(uid).then(name => ({ uid, name: name || uid }))));
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
					
					return message.reply(
						(inWL.length > 0 ? getLang("removed", inWL.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
						+ (notInWL.length > 0 ? getLang("notAdmin", notInWL.length, notInWL.map(uid => `• ${uid}`).join("\n")) : "")
					);
				}
				else
					return message.reply(getLang("missingIdRemove"));
			}
			case "list":
			case "-l": {
				const getNames = await Promise.all(config.whiteListMode.whiteListIds.map(uid => usersData.getName(uid).then(name => ({ uid, name: name || uid }))));
				return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")));
			}
			case "on": {
				config.whiteListMode.enable = true;
				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
				return message.reply(getLang("enable"));
			}
			case "off": {
				config.whiteListMode.enable = false;
				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
				return message.reply(getLang("disable"));
			}
			default:
				return message.SyntaxError();
		}
	}
};
