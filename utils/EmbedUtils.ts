import { Collection, Guild, PermissionsBitField, REST, Routes, ColorResolvable, Embed, EmbedBuilder, MessageType, Message, Channel, TextChannel } from 'discord.js';
import { Utilities } from './Utilities';

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
}