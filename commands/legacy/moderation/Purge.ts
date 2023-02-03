import { Channel, Client, ColorResolvable, EmbedBuilder, GuildChannel, Message, PermissionsBitField, TextChannel } from "discord.js";
import { EmbedUtils, messageType } from '../../../utils/EmbedUtils';
import { Utilities } from '../../../utils/Utilities';


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
            let messagesToRemoveInt : number = parseInt(args[0])
            if (!messagesToRemoveInt) { new EmbedUtils().sendArgsErrorEmbed(message, 1, module.exports); return; }

            if (messagesToRemoveInt === 0) {
                new EmbedUtils().sendErrorEmbed(message, messageType.Embed, {embedColor: color, })
                return;
            }

            deleteMsgs(messagesToRemoveInt, message);
        } 
    }
}

async function deleteMsgs(count : number, orgMessage : Message) {
    console.log("hello")
    let channel : TextChannel = orgMessage.channel as TextChannel

    await orgMessage.delete()

    if (count <= 100) {
        await channel.bulkDelete(count).then(msgs => {
            new EmbedUtils().sendSuccessEmbed(channel, null, {successEmoji: true, replyToMessage: false, deleteMsg: true}, {description: `Successfully deleted ${msgs.size} messages`})
        })
    }else {

    }
}