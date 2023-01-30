import { Client, ColorResolvable, EmbedBuilder, GuildMember, Message, User } from "discord.js";
import Settings from "../../../schemas/Settings";
import { createFile } from "../../../utils/CreateFile";

module.exports = {
    commands: ['avatar', 'av', 'pfp'],
    maxArgs: 1,
    expectedArgs: "(@User/User ID)",
    cooldown: 1,
    callback: async (client: Client, message: Message, args: string[]) => {

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if (!settings) {
            createFile({ guild: message.guild! });
            message.channel.send({ content: "Sorry, your settings file doesn't exist! If this error persists contact support" });
            return;
        }

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

        let user = message.mentions.members?.first() || await message.guild?.members.fetch(args[0]).catch(() => {}) || await client.users.fetch(args[0]).catch(() => {});
        if(!args[0]) {
            user = message.author;
        }
        if(!user) return message.channel.send({ content: "Unable to fetch that member! Please try again." })

        const avatarEmbed = new EmbedBuilder()
            .setAuthor({ name: `${(user as User).tag} Avatar`, iconURL: (user as User).displayAvatarURL() || undefined })
            .setColor(color)
            .setImage((user as User).displayAvatarURL({ size: 512 }) || null)
            .setFooter({ text: `Requested by ${message.author.tag}` })
        message.channel.send({ embeds: [avatarEmbed] })

        

    }
}