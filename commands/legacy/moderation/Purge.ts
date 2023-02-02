import { Client, ColorResolvable, EmbedBuilder, Message, PermissionsBitField, TextChannel } from "discord.js";
import Settings from "../../../schemas/Settings";
import { Utilities } from "../../../utils/Utilities";


module.exports = {
    commands: ["purge", "clear", "remove"],
    minArgs: 1,
    expectedArgs: "[message amount]",
    commandCategory: "Moderation",
    callback: async (client: Client, message: Message, args: string[]) => {
        if(!message.guild?.members.me?.permissions.has([ PermissionsBitField.Flags.ChangeNickname ])) return message.channel.send({ content: "I am unable to edit nicknames!" })
        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if (!settings) {
            new Utilities().createFile({ guild: message.guild! });
            message.channel.send({ content: "Sorry, your settings file doesn't exist! If this error persists contact support" });
            return;
        }

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

        message.channel.send({ content: "This bot likes men" })

    }
}