import { Client, ColorResolvable, EmbedBuilder, Message, PermissionsBitField, TextChannel } from "discord.js";
import Settings from "../../../schemas/Settings";
import { Utilities } from "../../../utils/Utilities";


module.exports = {
    commands: ["nick", "nickname"],
    minArgs: 1,
    expectedArgs: "[@User/User ID] [Reset/New Nickname]",
    commandCategory: "Moderation",
    callback: async (client: Client, message: Message, args: string[]) => {
        if(!message.guild?.members.me?.permissions.has([ PermissionsBitField.Flags.ChangeNickname ])) return message.channel.send({ content: "I am unable to edit nicknames!" })
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

        if(message.guild.ownerId === user.id || user.roles.highest.position > message.guild.members.me.roles.highest.position) return message.channel.send({ content: "I am unable to edit their username!" })

        let newNick: string | null = null
        let response = `You have reset **${user.user.tag}**'s nickname!`
        let action = "Nickname Reset"

        if(args[1]) {
            newNick = args.splice(1).join(" ");
            response = `You have set **${user.user.tag}**'s nickname to \`${newNick}\`!`
            action = "Nickname Set"
        }
        
        let oldNick = user.user.username;
        if(user.nickname) {
            oldNick = user.nickname;
        }
        
        user.setNickname(newNick).catch((err: Error) => {
            console.error(err);
            message.channel.send({ content: "An unknwon error occurred! If this issue persists, please join our support server." })
        });
        
        const nickSet = new EmbedBuilder()
        .setDescription(response)
        .setColor(color)
        message.channel.send({ embeds: [nickSet] });
        
        const modLogEmbed = new EmbedBuilder()
            .setAuthor({ name: "Nickname Edited", iconURL: user.user.displayAvatarURL() || undefined })
            .setThumbnail(user.user.displayAvatarURL() || null)
            .setColor(color)
            .setDescription(`<:user:977391493218181120> **User:** ${user.user.tag} (${user.id})
            <:folder:977391492790362173> **Mod:** ${message.author.tag} (${message.author.id})
            <:pencil:977391492916207636> **Action:** ${action}
            > \`${oldNick}\` -> \`${newNick}\``)
            .setTimestamp()
        const channel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel!);
        let exists = true
        if (!channel) { exists = false; }
        if (exists == true) {
            if (message.guild.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                await (message.guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({embeds: [modLogEmbed]})
            }
        }
        

    }
}