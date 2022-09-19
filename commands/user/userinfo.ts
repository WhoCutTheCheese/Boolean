import { SlashCommandBuilder, CommandInteraction, Client, EmbedBuilder, ColorResolvable, GuildMember, User, Role, ChatInputCommandInteraction } from "discord.js";
import Configuration from "../../models/config";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Get information on a user.")
        .addUserOption(user =>
            user.setName("user")
                .setRequired(false)
                .setDescription("Select a user.")
        ),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const configuration = await Configuration.findOne({
            guildID: interaction.guild?.id
        })
        const color = configuration?.embedColor as ColorResolvable;
        const user = interaction.options.getUser("user");
        if (!user) {
            const userInfoAuthor = new EmbedBuilder()
                .setAuthor({ name: `${interaction.user?.username}`, iconURL: interaction.user?.avatarURL() || undefined })
                .setThumbnail(interaction.user?.displayAvatarURL() || null)
                .setColor(color)
                .addFields(
                    { name: "Name:", value: `${interaction.user.id}`, inline: true },
                    { name: "Is Bot:", value: `${interaction.user.bot}`, inline: true },
                    { name: "General Information:", value: `**Mention:** <@${interaction.user?.id}>\n**ID:** ${interaction.user?.id}\n**Highest Role:** ${(interaction.member as GuildMember).roles.highest}\n**Avatar:** [Link](${interaction.user?.displayAvatarURL({ size: 512 })})\n**Display Name:** ${interaction.user?.username}` },
                    { name: "🗓️ Account Joined:", value: `<t:${Math.floor((interaction.member as GuildMember).joinedAt!.getTime() / 1000)}:D> (<t:${Math.floor((interaction.member as GuildMember).joinedAt!.getTime() / 1000)}:R>)`, inline: true },
                    { name: "🗓️ Account Created:", value: `<t:${Math.floor((interaction.user as User).createdAt.getTime() / 1000)}:D> (<t:${Math.floor((interaction.user as User).createdAt.getTime() / 1000)}:R>)`, inline: true },
                )
                .setFooter({ text: `Requested by ${interaction.user?.tag}`, iconURL: interaction.user?.avatarURL() || undefined })
            return interaction.reply({ embeds: [userInfoAuthor] })
        }
        let joinedAt
        let highestRole
        let nickname
        if(interaction.guild?.members.cache.get(user.id)) {
            let user2 = interaction.guild.members.cache.get(user.id)
            joinedAt = `<t:${Math.floor((user2 as GuildMember).joinedAt!.getTime() / 1000)}:D> (<t:${Math.floor((user2 as GuildMember).joinedAt!.getTime() / 1000)}:R>)`
            highestRole = (user2 as GuildMember).roles.highest
            nickname = user2?.user.username
        } else {
            joinedAt = "Not Cached/Not In Server"
            highestRole = "Not Cached/Not In Server"
            nickname = "Not Cached/Not In Server"
        }
        const userInfoAuthor = new EmbedBuilder()
            .setAuthor({ name: `${user?.username}`, iconURL: user?.avatarURL() || undefined })
            .setThumbnail(user?.displayAvatarURL() || null)
            .setColor(color)
            .addFields(
                { name: "Name:", value: `${user.tag}`, inline: true },
                { name: "Is Bot:", value: `${user.bot}`, inline: true },
                { name: "General Information:", value: `**Mention:** <@${user?.id}>\n**ID:** ${user?.id}\n**Highest Role:** ${highestRole}\n**Avatar:** [Link](${user?.displayAvatarURL({ size: 512 })})\n**Display Name:** ${nickname}` },
                { name: "🗓️ Account Joined:", value: joinedAt, inline: true },
                { name: "🗓️ Account Created:", value: `<t:${Math.floor((user as User).createdAt.getTime() / 1000)}:D> (<t:${Math.floor((user as User).createdAt.getTime() / 1000)}:R>)`, inline: true },
            )
            .setFooter({ text: `Requested by ${interaction.user?.tag}`, iconURL: user?.avatarURL() || undefined })
        return interaction.reply({ embeds: [userInfoAuthor] })

    }
}