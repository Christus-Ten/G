const axios = require('axios');
const baseApiUrl = async () => {
    return "https://baby-apisx.vercel.app";
};

module.exports.config = {
    name: "bby",
    aliases: ["baby"],
    version: "0.0.1",
    author: "ArYAN",
    countDown: 0,
    role: 0,
    description: "update simsim api by Aryan Rayhan",
    category: "CHARTING",
    guide: {
        en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nteach [react] [YourMessage] - [react1], [react2], [react3]... OR\nrm [YourMessage] (removes all replies) OR\nrm [YourMessage] - [specificReply] (removes only that reply) OR\nmsg [YourMessage] OR\nlist OR \nall OR\nedit [YourMessage] - [OldReply] - [NewReply]"
    }
};

module.exports.onStart = async ({
    api,
    event,
    args,
    usersData
}) => {
    const link = `${await baseApiUrl()}/baby`;
    const aryan = args.join(" ").toLowerCase();
    const uid = event.senderID;
    const botID = api.getCurrentUserID();
    let command, comd, final;

    try {
        if (!args[0]) {
            const ran = ["Bolo baby", "hum", "type help baby", "Hmm jan"];
            return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
        }

        if (args[0] === 'remove' || args[0] === 'rm') {
            const keyword = args[0];
            const rest = aryan.replace(`${keyword} `, "").trim();
            if (!rest || rest === keyword) {
                return api.sendMessage('❌ | Format: rm [message] OR rm [message] - [specificReply]', event.threadID, event.messageID);
            }

            if (rest.includes('-')) {
                const parts = rest.split(/\s*-\s*/);
                const question = parts[0]?.trim();
                const replyToRemove = parts[1]?.trim();
                if (!question || !replyToRemove) {
                    return api.sendMessage('❌ | Format: rm [message] - [specificReply]', event.threadID, event.messageID);
                }
                const da = (await axios.get(`${link}?remove=${encodeURIComponent(question)}&reply=${encodeURIComponent(replyToRemove)}&senderID=${uid}`)).data.message;
                return api.sendMessage(da, event.threadID, event.messageID);
            } else {
                const dat = (await axios.get(`${link}?remove=${encodeURIComponent(rest)}&senderID=${uid}`)).data.message;
                return api.sendMessage(dat, event.threadID, event.messageID);
            }
        }

        if (args[0] === 'list') {
            if (args[1] === 'all') {
                const data = (await axios.get(`${link}?list=all`)).data;
                const limit = parseInt(args[2]) || 100;
                const limited = data?.teacher?.teacherList?.slice(0, limit)
                const teachers = await Promise.all(limited.map(async (item) => {
                    const number = Object.keys(item)[0];
                    const value = item[number];
                    const name = await usersData.getName(number).catch(() => number) || "Not found";
                    return {
                        name,
                        value
                    };
                }));
                teachers.sort((a, b) => b.value - a.value);
                const output = teachers.map((t, i) => `${i + 1}/ ${t.name}: ${t.value}`).join('\n');
                return api.sendMessage(`Total Teach = ${data.length}\n👑 | List of Teachers of baby\n${output}`, event.threadID, event.messageID);
            } else {
                const d = (await axios.get(`${link}?list=all`)).data;
                return api.sendMessage(`❇️ | Total Teach = ${d.length || "api off"}\n♻️ | Total Response = ${d.responseLength || "api off"}`, event.threadID, event.messageID);
            }
        }

        if (args[0] === 'msg') {
            const fuk = aryan.replace("msg ", "");
            const d = (await axios.get(`${link}?list=${fuk}`)).data.data;
            return api.sendMessage(`Message ${fuk} = ${d}`, event.threadID, event.messageID);
        }

        if (args[0] === 'edit') {
            const restPart = aryan.replace("edit ", "").trim();
            const parts = restPart.split(/\s*-\s*/);
            
            if (parts.length < 3) {
                return api.sendMessage('❌ | Format: edit [question] - [oldReply] - [newReply]', event.threadID, event.messageID);
            }
            
            const editKey = parts[0]?.trim();
            const oldReply = parts[1]?.trim();
            const newReply = parts[2]?.trim();
            
            if (!editKey || !oldReply || !newReply || newReply.length < 1) {
                return api.sendMessage('❌ | Format: edit [question] - [oldReply] - [newReply]', event.threadID, event.messageID);
            }
            
            const dA = (await axios.get(`${link}?edit=${encodeURIComponent(editKey)}&oldReply=${encodeURIComponent(oldReply)}&replace=${encodeURIComponent(newReply)}&senderID=${uid}`)).data.message;
            return api.sendMessage(`${dA}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] !== 'amar' && args[1] !== 'react') {
            [comd, command] = aryan.split(/\s*-\s*/);
            final = comd.replace("teach ", "");
            if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const re = await axios.get(`${link}?teach=${final}&reply=${command}&senderID=${uid}&threadID=${event.threadID}`);
            const tex = re.data.message;
            let teacherName = "Unknown";
            try {
                const userData = await usersData.get(uid);
                teacherName = userData?.name || await usersData.getName(uid) || "Unknown";
            } catch (e) {
                try {
                    teacherName = await usersData.getName(uid) || "Unknown";
                } catch (e2) {
                    teacherName = "Unknown";
                }
            }
            return api.sendMessage(`✅ Replies added ${tex}\nTeacher: ${teacherName}\nTeachs: ${re.data.teachs}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] === 'amar') {
            [comd, command] = aryan.split(/\s*-\s*/);
            final = comd.replace("teach ", "");
            if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const tex = (await axios.get(`${link}?teach=${final}&senderID=${uid}&reply=${command}&key=intro`)).data.message;
            return api.sendMessage(`✅ Replies added ${tex}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] === 'react') {
            [comd, command] = aryan.split(/\s*-\s*/);
            final = comd.replace("teach react ", "");
            if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const tex = (await axios.get(`${link}?teach=${final}&react=${command}`)).data.message;
            return api.sendMessage(`✅ Replies added ${tex}`, event.threadID, event.messageID);
        }

        if (aryan.includes('amar name ki') || aryan.includes('amr nam ki') || aryan.includes('amar nam ki') || aryan.includes('amr name ki') || aryan.includes('whats my name')) {
            const data = (await axios.get(`${link}?text=amar name ki&senderID=${uid}&key=intro`)).data.reply;
            return api.sendMessage(data, event.threadID, event.messageID);
        }

        const d = (await axios.get(`${link}?text=${aryan}&senderID=${uid}&font=1`)).data.reply;
        api.sendMessage(d, event.threadID, (error, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                type: "reply",
                messageID: info.messageID,
                author: event.senderID,
                d,
                apiUrl: link
            });
        }, event.messageID);

    } catch (e) {
        console.log(e);
        api.sendMessage("Check console for error", event.threadID, event.messageID);
    }
};

module.exports.onReply = async ({
    api,
    event,
    Reply
}) => {
    try {
        const botID = api.getCurrentUserID();
        
        if (event.senderID === botID) {
            return;
        }
        
        if (event.type == "message_reply") {
            const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(event.body?.toLowerCase())}&senderID=${event.senderID}&font=1`)).data.reply;
            await api.sendMessage(a, event.threadID, (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    a
                });
            }, event.messageID);
        }
    } catch (err) {
        return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
    }
};

module.exports.onChat = async ({
    api,
    event,
    message
}) => {
    try {
        const botID = api.getCurrentUserID();
        
        if (event.senderID === botID) {
            return;
        }
        
        const body = event.body ? event.body?.toLowerCase() : ""
        if (body.startsWith("baby") || body.startsWith("bby") || body.startsWith("bot") || body.startsWith("nix") || body.startsWith("babu") || body.startsWith("beby")) {
            const arr = body.replace(/^\S+\s*/, "")
            const randomReplies = ["😚", "Yes 😀, I am here", "What's up?", "Bolo jaan ki korte panmr jonno"];
            if (!arr) {
        return await api.sendMessage(randomReplies[Math.floor(Math.random() * randomReplies.length)], event.threadID, (error, info) => {
                    if (!info) message.reply("info obj not found")
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: this.config.name,
                        type: "reply",
                        messageID: info.messageID,
                        author: event.senderID
                    });
                }, event.messageID)
            }
            const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(arr)}&senderID=${event.senderID}&font=1`)).data.reply;
           return await api.sendMessage(a, event.threadID, (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    a
                });
            }, event.messageID)
        }
    } catch (err) {
        return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
    }
};