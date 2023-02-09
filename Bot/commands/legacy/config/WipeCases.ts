import { Client, ColorResolvable, Message, PermissionsBitField } from "discord.js";
import { Utilities } from "../../../utils/Utilities";

module.exports = {
    commands: ['wipecases', 'deleteallcases'],
    maxArgs: 1,
    minArgs: 1,
    cooldown: 3,
    userPermissions: [PermissionsBitField.Flags.Administrator],
    expectedArgs: "[@User/User ID]",
    commandCategory: "Moderation",
    callback: async (client: Client, message: Message, args: string[]) => {

        if (message.member?.id != message.guild?.ownerId) {
            const msg = await message.channel.send({ content: "You are unable to use this command." })
            setTimeout(() => {
                msg.delete().catch(() => { })
            }, 3000)
        }

        const settings = await new Utilities().getGuildSettings(message.guild!);
        if (!settings) return;

        let color: ColorResolvable = await new Utilities().getEmbedColor(message.guild!);

    }
}