import { Collection, Guild, PermissionsBitField, REST, Routes, ColorResolvable, Embed, EmbedBuilder, MessageType, Message, Channel, TextChannel, GuildMember, User, Attachment } from 'discord.js';
import { Utilities } from './Utilities';
import { Document } from 'mongoose';

export enum messageType {
    String,
    Embed
}

export class EmbedUtils {
    async sendSuccessEmbed(channel : TextChannel, orgMessage : Message | null, settings: {successEmoji: boolean, replyToMessage: boolean, deleteMsg?: boolean, deleteTimerTime?: number}, args: {title?: string, description: string, footer?: string}) {
        console.log("????????????????????????")
        let embed = await new EmbedBuilder()
            .setTitle(args.title || "Success")
            .setDescription(`${(settings.successEmoji ? ":white_check_mark:" : "")} ${args.description}`)
            .setFooter({text: args.footer || " "})
            .setColor(await new Utilities().getEmbedColor(channel.guild))

        let newMSG : Message;
        if (settings.replyToMessage && orgMessage) {
            newMSG = await orgMessage.reply({embeds: [embed]});
        } else newMSG = await channel.send({embeds: [embed]})

        if (settings.deleteMsg) {
            setTimeout(() => {
                if (newMSG && newMSG.deletable) {
                    newMSG.delete()
                }
            }, settings.deleteTimerTime || 5000);
        }
    }

    sendErrorEmbed(message : Message, errorType : messageType, args: { embedColor : ColorResolvable, title?: string, description?: string}) {
        switch(errorType) {
            case messageType.Embed: {
                message.reply({embeds: [
                    new EmbedBuilder()
                    .setTitle(args.title || "Command Error")
                    .setDescription(`\`${args.description || "Unknown Error"}\``)
                    .setColor( args.embedColor || "#FF0000" as ColorResolvable)
                ] }) 
            }
            default: {
                message.reply({content: `There was an error executing this command: \`${args.description || "Unknown Error"}\``}) 
            }
        }
    } // For general purpose args

    async sendArgsErrorEmbed(message : Message, argPlacement : number, cmdExports : typeof module.exports) {
        let description : string = `Invalid argument found at position \`${argPlacement}\`\n\nCMD Args: \`${cmdExports.expectedArgs}\``; if (cmdExports.subCommands) description = description.concat(`\nSub commands: \`${cmdExports.subCommands.join(", ")}\``)
        message.reply({embeds: [
            new EmbedBuilder()
            .setTitle("Argument Error")
            .setDescription(description)
            .setColor(await new Utilities().getEmbedColor(message.guild) || "#FF0000" as ColorResolvable)
        ]}) 
    } // Look pretty arg errors


    async sendModLogs(options: {
        guild: Guild,
        settings: any;
        mod: GuildMember,
        target?: GuildMember,
        targetUser?: User,
        action: string,
        attachments?: Attachment;
    }, embedDetails: {
        title: string,
        actionInfo: string,
        channel?: Channel,
    }) {
        const { guild, settings } = options;

        let user: GuildMember | User | undefined = options.target;
        let mod: GuildMember = options.mod;
        if(options.targetUser) {
            user = options.targetUser;
        }
        let users = `<:folder:977391492790362173> **Mod:** ${mod.user.tag} (${mod.id})`
        if(user) {
            users = users + `\n<:user:977391493218181120> **User:** ${(user as User).tag} (${user.id})`
        }
        let action = `<:pencil:977391492916207636> **Action:** ${options.action}
        > ${embedDetails.actionInfo}`
        let theChannel = ``
        if(embedDetails.channel) {
            theChannel = `\n<:channel:1071217768046800966> **Channel:** <#${embedDetails.channel.id}>`
        }

        const modLogEmbed = new EmbedBuilder()
            .setAuthor({ name: embedDetails.title, iconURL: mod.displayAvatarURL() || undefined })
            .setDescription(`${users} ${theChannel}
            <:clock:1071213725610151987> **Date:** <t:${Math.round(Date.now() / 1000)}:D>
            ${action}`)
            .setColor(await new Utilities().getEmbedColor(options.guild))
        const channel = guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel!);
        let exists = true
        if (!channel) { exists = false; }
        if (exists == true) {
            if (guild.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                if(options.attachments) {
                    await (guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({embeds: [modLogEmbed], files: [options.attachments] });
                } else {
                    await (guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({embeds: [modLogEmbed] });
                }
            }
        }

    }

}