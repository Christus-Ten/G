const { findUid } = global.utils;

module.exports = {
        config: {
                name: "uid",
                version: "1.5",
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
                                + "\n   Phản hồi tin nhắnের মাধ্যমে অন্যের UID দেখা",
                        en: "   {pn}: use to view your facebook user id"
                                + "\n   {pn} @tag: view facebook user id of tagged people"
                                + "\n   Reply to someone's message to view their facebook user id"
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
                        const name = await global.utils.getName(uid, api) || "User";
                        const msg = `— USER ID —\nName: ${name}\nUID: ${uid}`;
                        return api.shareContact(msg, uid, event.threadID, (err) => {
                                if (err) return message.reply(msg);
                        });
                } catch (error) {
                        return message.reply(uid);
                }
        }
};
