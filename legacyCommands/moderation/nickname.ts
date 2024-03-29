import { Client, ColorResolvable, EmbedBuilder, Message, PermissionsBitField, TextChannel } from "discord.js";
import Settings from "../../models/settings";
import Permits from "../../models/permits";

module.exports = {
    commands: ["nick", "nickname"],
    minArgs: 1,
    expectedArgs: "[@User/User ID] [Reset/New Nickname]",
    commandName: "NICKNAME",
    commandCategory: "MODERATION",
    callback: async (client: Client, message: Message, args: string[]) => {

        if (!message.guild?.members.me?.permissions.has([PermissionsBitField.Flags.ManageNicknames])) return message.channel.send({ content: "I require the `Manage Nicknames` permission to edit nicknames!" });

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if (!settings) return message.channel.send({ content: "Sorry, your settings file doesn't exist! If this error persists contact support" })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

        const permits = await Permits.find({
            guildID: message.guild?.id
        })

        const user = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
        if (!user) return message.channel.send({ content: "Invalid User!" })

        if (user.id === message.guild?.ownerId) return message.channel.send({ content: "You cannot change this user's nickname!" })

        let ObjectID: any
        for (const permit of permits) {
            if (permit.users.includes(user.id)) {
                ObjectID = permit._id;
                break;
            }
        }

        const thePermit = await Permits.findOne({
            _id: ObjectID
        })
        if (thePermit?.commandAccess.includes("NICKNAME") || thePermit?.commandAccess.includes("MODERATION")) return message.channel.send({ content: "You cannot change this user's nickname!" });

        if (message.guild.members.me.roles.highest.position < user.roles.highest.position) return message.channel.send({ content: "This user is above me! I cannot change their nickname." })

        if (args[1].toLocaleLowerCase() === "reset") {

            const modLogs = new EmbedBuilder()
                .setAuthor({ name: `Nickname Updated - ${user.user.tag}`, iconURL: user.user.displayAvatarURL() || undefined })
                .setThumbnail(user.user.displayAvatarURL() || null)
                .setDescription(`<:user:977391493218181120> **User:** ${user.user.tag}
                > [${user.user.id}]
                > [<@${user.user.id}>]

                <:folder:977391492790362173> **Mod:** ${message.author.tag}
                > [${message.author.id}]
                > [<@${message.author.id}>]

                <:pencil:977391492916207636> **Action:** Nickname
                > [Nickname Reset]

                **Channel:** <#${message.channel?.id}>
                **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                .setColor(color)
                .setTimestamp()
            const channel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel!);
            let exists = true
            if (!channel) { exists = false; }
            if (exists == true) {
                if (message.guild.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                    (message.guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
                }
            }

            user.setNickname(null).catch((err: Error) => {
                console.error(err)
                message.channel.send({ content: "I could not edit this user's nickname!" })});

            const nicknameResetEmbed = new EmbedBuilder()
                .setColor(color)
                .setDescription(`**${user?.user.tag}**'s nickname has been reset!`)
            return message.channel.send({ embeds: [nicknameResetEmbed] })

        }

        const nickname = args.splice(1).join(" ");
        if (nickname.length > 32) return message.channel.send({ content: "Nickname length exceeds maximum length. (32 Characters)" })

        const modLogs = new EmbedBuilder()
            .setAuthor({ name: `Nickname Updated - ${user.user.tag}`, iconURL: user.user.displayAvatarURL() || undefined })
            .setThumbnail(user.user.displayAvatarURL() || null)
            .setDescription(`<:user:977391493218181120> **User:** ${user.user.tag}
            > [${user.user.id}]
            > [<@${user.user.id}>]

            <:folder:977391492790362173> **Mod:** ${message.author.tag}
            > [${message.author.id}]
            > [<@${message.author.id}>]

            <:pencil:977391492916207636> **Action:** Nickname
            > [**New Nickname:** ${nickname}]

            **Channel:** <#${message.channel?.id}>
            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
            .setColor(color)
            .setTimestamp()
        const channel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel!);
        let exists = true
        if (!channel) { exists = false; }
        if (exists == true) {
            if (message.guild.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                (message.guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
            }
        }

        user.setNickname(nickname).catch((err: Error) => {
            console.error(err)
            message.channel.send({ content: "I could not edit this user's nickname!" })});

        const nicknameSetEmbed = new EmbedBuilder()
            .setColor(color)
            .setDescription(`**${user?.user.tag}**'s nickname has been set to **${nickname}**!`)
        return message.channel.send({ embeds: [nicknameSetEmbed] })


    }
}