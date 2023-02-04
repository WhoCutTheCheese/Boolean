import { Channel, Client, ColorResolvable, EmbedBuilder, GuildChannel, Message, PermissionsBitField, TextChannel, time, AttachmentBuilder, Attachment, RESTPostAPIWebhookWithTokenQuery, GuildMember, User } from 'discord.js';
import { EmbedUtils, messageType } from '../../../utils/EmbedUtils';
import { Utilities } from '../../../utils/Utilities';
import fs from 'fs'
import os from 'os'
import { WriteFileCallback } from "typescript";

module.exports = {
    commands: ["purge", "clear", "remove"],
    minArgs: 1,
    maxArgs: 2,
    expectedArgs: "[sub command] (message amount)",
    subCommands: ["bots", "users", "images"],
    botPermissions: [PermissionsBitField.Flags.ManageMessages],
    userPermissions: [PermissionsBitField.Flags.ManageMessages],
    cooldown: 5,
    commandCategory: "Moderation",
    callback: async (client: Client, message: Message, args: string[]) => {

        let color: ColorResolvable = await new Utilities().getEmbedColor(message.guild!)

        if (args.length === 1) {
            let messagesToRemoveInt: number = parseInt(args[0])
            if (!messagesToRemoveInt) { new EmbedUtils().sendArgsErrorEmbed(message, 1, module.exports); return; }

            if (messagesToRemoveInt === 0) { new EmbedUtils().sendArgsErrorEmbed(message, 1, module.exports, { description: "You cannot purge less than 1 message." }); return; }

            deleteMsgs(messagesToRemoveInt, message.member!, message, null);

            return;
        }

        let messagesToRemoveInt: number = parseInt(args[1])
        if (!messagesToRemoveInt) { new EmbedUtils().sendArgsErrorEmbed(message, 2, module.exports); return; }

        if (messagesToRemoveInt === 0) { new EmbedUtils().sendArgsErrorEmbed(message, 2, module.exports, { description: "You cannot purge less than 1 message." }); return; }

        switch (args[0].toString().toLowerCase().trim()) {
            case "bot": {
                deleteMsgs(messagesToRemoveInt, message.member!, message, (msg: Message) => {
                    if (!msg.author.bot) return false;
                    return true;
                })
            }
            case "users": {
                deleteMsgs(messagesToRemoveInt, message.member!, message, (msg: Message) => {
                    if (msg.author.bot) return false;
                    return true;
                })
            }
            case "images": {
                deleteMsgs(messagesToRemoveInt, message.member!, message, (msg: Message) => {
                    for (let atchment of msg.attachments) {
                        console.log(atchment[0])
                        let attachmentURL = atchment[1].url
                        if (attachmentURL.endsWith('.png') || attachmentURL.endsWith('.jpg') || attachmentURL.endsWith('.jpeg')) return true
                    }
                    return false;
                })
            }
        }
    }
}

async function deleteMsgs(count: number, member: GuildMember, orgMessage: Message, filter: Function | null) {
    let channel: TextChannel = orgMessage.channel as TextChannel

    if (count > 500) {
        new EmbedUtils().sendArgsErrorEmbed(orgMessage, 1, module.exports, { description: "Purge amount can not be over 500!" })
        return;
    }

    count = count += 1

    let msgsDeletedSize = 0;
    let messagesDeleted: Array<String> = []

    if (count <= 100) {
        try {
            await channel.bulkDelete(await getMessagesWithFilter(count, channel, filter) || count, true).then(messages => {
                msgsDeletedSize += messages.size;
                for (let msgarray of messages) {
                    try {
                        let msg = msgarray[1] as Message
                        if (!msg || !msg.deletable) continue;
                        messagesDeleted.push(`${msg.author.username}#${msg.author.discriminator} | ${msg.content}`)
                        msgsDeletedSize += 1
                    } catch (err) { }
                }
                new EmbedUtils().sendSuccessEmbed(channel, null, { successEmoji: true, replyToMessage: false, deleteMsg: true }, { description: `Successfully deleted ${messages.size} messages` })
            })
        } catch (err) {
            new EmbedUtils().sendErrorEmbed(channel, null, { errorEmoji: true, replyToMessage: false }, { title: "Command error", description: "There was an error executing this command, please try again soon.", footer: "Contact boolean support if this error prosists." })
            console.error(err)
            return;
        }
    } else {
        let timesToLoop = Math.floor(count / 100);
        let remainder = count % 100;

        while (timesToLoop >= 1) {
            timesToLoop -= 1

            let filteredMsgs = await getMessagesWithFilter(100, channel, filter)

            if (filter && filteredMsgs) {
                for (let msg of filteredMsgs) {
                    try {
                        if (!msg || !msg.deletable) continue;
                        messagesDeleted.push(`${msg.author.username}#${msg.author.discriminator} | ${msg.content}`)
                        msgsDeletedSize += 1
                    } catch (err) { }
                }
            } else {
                await channel.messages.fetch({ limit: 100 }).then(async messages => {
                    // Log the messages
                    for (let msgarray of messages) {
                        try {
                            let msg = msgarray[1] as Message
                            if (!msg || !msg.deletable) continue;
                            messagesDeleted.push(`${msg.author.username}#${msg.author.discriminator} | ${msg.content}`)
                            msgsDeletedSize += 1
                        } catch (err) { }
                    }
                });
            }

            try {
                await channel.bulkDelete(filteredMsgs || 100, true)
            } catch (err) {
                new EmbedUtils().sendErrorEmbed(channel, null, { errorEmoji: true, replyToMessage: false }, { title: "Command error", description: "There was an error executing this command, please try again soon.", footer: "Contact boolean support if this error prosists." })
                console.error(err)
                return;
            }
        }

        let filteredMsgs = await getMessagesWithFilter(remainder, channel, filter)

        if (filter && filteredMsgs) {
            for (let msg of filteredMsgs) {
                try {
                    if (!msg || !msg.deletable) continue;
                    messagesDeleted.push(`${msg.author.username}#${msg.author.discriminator} | ${msg.content}`)
                    msgsDeletedSize += 1
                } catch (err) { }
            }
        } else {
            await channel.messages.fetch({ limit: remainder, cache: true }).then(async messages => {
                for (let msgarray of messages) {
                    try {
                        let msg = msgarray[1] as Message
                        if (!msg || !msg.deletable) continue;
                        messagesDeleted.push(`${msg.author.username}#${msg.author.discriminator} | ${msg.content}`)
                        msgsDeletedSize += 1
                    } catch (err) { }
                }
            });
        }

        try {
            await channel.bulkDelete(await getMessagesWithFilter(remainder, channel, filter) || remainder, true)
        } catch (err) {
            new EmbedUtils().sendErrorEmbed(channel, null, { errorEmoji: true, replyToMessage: false }, { title: "Command error", description: "There was an error executing this command, please try again soon.", footer: "Contact boolean support if this error prosists." })
            console.error(err)
            return;
        }
    }

    if (msgsDeletedSize - 1 === 0) return;
    new EmbedUtils().sendModLogs({ guild: channel.guild, mod: member!, action: "Purge", attachments: [await generateAttachmentFileFromArray(messagesDeleted)] }, { title: "Channel purged", actionInfo: `${msgsDeletedSize - 1} messages were deleted` })
}

async function generateAttachmentFileFromArray(array: Array<String>) {
    const fileContent = array.join('\n');
    await fs.writeFileSync(`${os.tmpdir}/purgeCMD.txt`, fileContent)
    let att = await new AttachmentBuilder(`${os.tmpdir}/purgeCMD.txt`)
    return att
}

async function getMessagesWithFilter(count: number, channel: TextChannel, filter: Function | null): Promise<Message<boolean>[] | null> {

    if (!filter) return null;

    let messagesToDelete: Array<Message> = []

    while (messagesToDelete.length < count) {
        await channel.messages.fetch({ limit: 100 }).then(async messages => {
            for (let msgarray of messages) {
                let msg = msgarray[1] as Message
                if (!msg || !msg.deletable) continue;
                if (messagesToDelete.length >= count) return;
                if (!filter(msg)) continue;
                messagesToDelete.push(msg);
            }
        });
    }

    return messagesToDelete;

}