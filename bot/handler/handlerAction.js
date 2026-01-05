const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

module.exports = (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) => {
        const handlerEvents = require(process.env.NODE_ENV == 'development' ? "./handlerEvents.dev.js" : "./handlerEvents.js")(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

        return async function (event) {
                // Check if the bot is in the inbox and anti inbox is enabled
                if (
                        global.GoatBot.config.antiInbox == true &&
                        (event.senderID == event.threadID || event.userID == event.senderID || event.isGroup == false) &&
                        (event.senderID || event.userID || event.isGroup == false)
                )
                        return;

                const message = createFuncMessage(api, event);

                const { body } = event;
                const prefix = global.utils.getPrefix(event.threadID);

                // ————————————————— CHECK NIXPREFIX ————————————————— //
                let processedBody = body;
                if (body) {
                        const bodyTrim = body.trim();
                        const [commandName] = bodyTrim.split(/ +/);
                        const command = global.GoatBot.commands.get(commandName.toLowerCase()) || 
                                        global.GoatBot.commands.get(global.GoatBot.aliases.get(commandName.toLowerCase()));
                        
                        if (command && command.config && command.config.nixPrefix === true) {
                                // Execute command without prefix
                                processedBody = prefix + bodyTrim;
                                event.body = processedBody;
                                // Crucial: Re-parse event.args if needed by downstream handlers
                                event.args = bodyTrim.split(/ +/).slice(1);
                        }
                }

                if (processedBody && processedBody.startsWith(prefix)) {
                        const bodySlice = processedBody.slice(prefix.length).trim();
                        const [matchedCommand] = bodySlice.split(/ +/);
                        if (!matchedCommand || !global.GoatBot.commands.has(matchedCommand)) {
                                const allCommands = Array.from(global.GoatBot.commands.keys());
                                const { closestMatch, distance } = allCommands.reduce((acc, cmd) => {
                                        const dist = global.utils.levenshteinDistance(matchedCommand || "", cmd);
                                        if (dist < acc.distance) return { closestMatch: cmd, distance: dist };
                                        return acc;
                                }, { closestMatch: null, distance: Infinity });

                                if (matchedCommand && distance <= 2) {
                                        return message.reply(`Command "${matchedCommand}" does not exist, type ${prefix}help to see all available commands\n\n🧘 Did you mean: ${prefix}${closestMatch}?`);
                                } else {
                                        return message.reply(`The command you are using does not exist, type ${prefix}help to see all available commands`);
                                }
                        }
                }

                await handlerCheckDB(usersData, threadsData, event);
                const handlerChat = await handlerEvents(event, message);
                if (!handlerChat)
                        return;

                const {
                        onAnyEvent, onFirstChat, onStart, onChat,
                        onReply, onEvent, handlerEvent, onReaction,
                        typ, presence, read_receipt
                } = handlerChat;


                onAnyEvent();
                switch (event.type) {
                        case "message":
                        case "message_reply":
                        case "message_unsend":
                                onFirstChat();
                                onChat();
                                onStart();
                                onReply();
                                break;
                        case "event":
                                handlerEvent();
                                onEvent();
                                break;
                        case "message_reaction":
                                onReaction();
                                break;
                        case "typ":
                                typ();
                                break;
                        case "presence":
                                presence();
                                break;
                        case "read_receipt":
                                read_receipt();
                                break;
                        // case "friend_request_received":
                        // { /* code block */ }
                        // break;

                        // case "friend_request_cancel"
                        // { /* code block */ }
                        // break;
                        default:
                                break;
                }
        };
};