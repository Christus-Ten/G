const { findUid } = global.utils;
const regExCheckURL = /^(http|https):\/\/[^ "]+$/;

module.exports = {
	config: {
		name: "uid",
		version: "1.4",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			vi: "Xem user id facebook của người dùng",
			en: "View facebook user id of user"
		},
		category: "info",
		guide: {
			vi: "   {pn}: dùng để xem id facebook của bạn"
				+ "\n   {pn} @tag: xem id facebook của những người được tag"
				+ "\n   {pn} <link profile>: xem id facebook của link profile"
				+ "\n   Phản hồi tin nhắn của người khác kèm lệnh để xem id facebook của họ",
			en: "   {pn}: use to view your facebook user id"
				+ "\n   {pn} @tag: view facebook user id of tagged people"
				+ "\n   {pn} <profile link>: view facebook user id of profile link"
				+ "\n   Reply to someone's message with the command to view their facebook user id"
		}
	},

	onStart: async function ({ api, message, event, args }) {
		let uid;
		if (event.type === "message_reply") {
			uid = event.messageReply.senderID;
		} else if (Object.keys(event.mentions || {}).length > 0) {
			uid = Object.keys(event.mentions)[0];
		} else {
			uid = args[0] || event.senderID;
		}

		try {
			if (api.shareContact) {
				await api.shareContact(uid, uid, event.threadID, event.messageID);
			} else {
				message.reply(uid);
			}
		} catch (error) {
			message.reply(uid);
		}
	}
};
