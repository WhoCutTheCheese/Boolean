import {Client, ColorResolvable, Message} from "discord.js";
import Settings from "../../../schemas/Settings";
import { Utilities } from "../../../utils/Utilities";

module.exports = {
    commands: ["warn", "warning", "infract"],
    minArgs: 1,
    expectedArgs: "[@User/User ID] [Reason]",
    commandCategory: "Moderation",
    callback: async (client: Client, message: Message, args: string[]) => {

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if (!settings) {
            await new Utilities().createFile({guild: message.guild!});
            message.channel.send({ content: "Sorry, your settings file doesn't exist! If this error persists contact support" });
            return;
        }

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

        const user = message.mentions.members?.first() || await message.guild?.members.fetch(args[0]).catch(() => {});
        if(!user) return message.channel.send({ content: "Unable to fetch that member! Please try again." });

    }
}