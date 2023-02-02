import { Client, ColorResolvable, EmbedBuilder, Message, PermissionsBitField, TextChannel } from "discord.js";
import Settings from "../../../schemas/Settings";
import { Utilities } from "../../../utils/Utilities";


module.exports = {
    commands: ["purge", "clear", "remove"],
    minArgs: 1,
    expectedArgs: "[message amount]",
    botPermissions: [PermissionsBitField.Flags.ManageMessages],
    userPermissions: [PermissionsBitField.Flags.ManageMessages],
    commandCategory: "Moderation",
    callback: async (client: Client, message: Message, args: string[]) => { 
       
        let color: ColorResolvable = await new Utilities().getEmbedColor(message.guild!)
        

    }
}