import { Channel, Client, ColorResolvable, EmbedBuilder, GuildChannel, Message, PermissionsBitField, TextChannel, time, AttachmentBuilder, Attachment, RESTPostAPIWebhookWithTokenQuery } from 'discord.js';
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
    commandCategory: "Moderation",
    callback: async (client: Client, message: Message, args: string[]) => {

        let color: ColorResolvable = await new Utilities().getEmbedColor(message.guild!)

        if (args.length === 1) {
            let messagesToRemoveInt: number = parseInt(args[0])
            if (!messagesToRemoveInt) { new EmbedUtils().sendArgsErrorEmbed(message, 1, module.exports); return; }

            if (messagesToRemoveInt === 0) {
                new EmbedUtils().sendErrorEmbed(message, messageType.Embed, { embedColor: color, })
                return;
            }

            deleteMsgs(messagesToRemoveInt, message, null);
        }

        switch (args[0].toString().toLowerCase().trim()) {
            case "bot": {

            }
        }
    }
}

async function deleteMsgs(count: number, orgMessage: Message, filter: Function | null) {
    let channel: TextChannel = orgMessage.channel as TextChannel

    if (count > 500) {
        new EmbedUtils().sendArgsErrorEmbed(orgMessage, 1, module.exports, { description: "Purge amount can not be over 500!" })
        return;
    }

    await orgMessage.delete()

    let msgsDeletedSize = 0;
    let messagesDeleted: Array<String> = []

    if (count <= 100) {
        await channel.bulkDelete(count).then(messages => {
            msgsDeletedSize += messages.size;
            for (let msgarray of messages) {
                try {
                    let msg = msgarray[1] as Message
                    messagesDeleted.push(`${msg.author.username}#${msg.author.discriminator} | ${msg.content}`)
                    msgsDeletedSize += 1
                } catch (err) { }
            }
            new EmbedUtils().sendSuccessEmbed(channel, null, { successEmoji: true, replyToMessage: false, deleteMsg: true }, { description: `Successfully deleted ${messages.size} messages` })
        })
    } else {
        let timesToLoop = Math.floor(count / 100);
        let remainder = count % 100;

        while (timesToLoop >= 1) {
            timesToLoop -= 1

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

            await channel.bulkDelete(100)
        }

        await channel.messages.fetch({ limit: remainder }).then(async messages => {
            for (let msgarray of messages) {
                try {
                    let msg = msgarray[1] as Message
                    if (!msg || !msg.deletable) continue;
                    messagesDeleted.push(`${msg.author.username}#${msg.author.discriminator} | ${msg.content}`)
                    msgsDeletedSize += 1
                } catch (err) { }
            }

            await channel.bulkDelete(remainder)
        });
    }

    new EmbedUtils().sendModLogs({ guild: channel.guild, mod: orgMessage.member!, action: "Purge", attachments: [await generateAttachmentFileFromArray(messagesDeleted)] }, { title: "Channel purged", actionInfo: `${msgsDeletedSize} messages were deleted` })
}

async function generateAttachmentFileFromArray(array: Array<String>) {
    const fileContent = array.join('\n');
    await fs.writeFileSync(`${os.tmpdir}/purgeCMD.txt`, fileContent)
    let att = await new AttachmentBuilder(`${os.tmpdir}/purgeCMD.txt`)
    return att
}
