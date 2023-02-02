import { ChatInputCommandInteraction, Client, ColorResolvable, EmbedBuilder, Guild, SlashCommandBuilder, messageLink } from "discord.js";
import Settings from "../../../schemas/Settings";
import { Utilities } from "../../../utils/Utilities";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Get an extensive view of any user's information.")
        .setDMPermission(false)
        .addUserOption(user =>
            user.setName("user")
                .setDescription("Input any user on Discord.")
                .setRequired(false)
        ),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (!interaction.inCachedGuild()) return interaction.reply({ content: "You must be inside a cached guild to use this command!", ephemeral: true })

        let color: ColorResolvable = await new Utilities().getEmbedColor(interaction.guild!)

        let user = interaction.options.getUser("user");
        let member = interaction.options.getMember("user");

        if (!user) {
            user = interaction.user
            member = interaction.member
        }

        let nickname
        let joinedAt
        let highestRole
        if (member) {
            if (member.nickname) {
                nickname = member.nickname
            } else {
                nickname = user.username
            }
            joinedAt = `<t:${Math.floor(member.joinedAt?.getTime()! / 1000)}:D> (<t:${Math.floor(member.joinedAt?.getTime()! / 1000)}:R>)`
            highestRole = `<@&${member.roles.highest.id}> (${member.roles.highest.position})`
        } else {
            nickname = "Not Cached/Not in Server"
            joinedAt = "Not Cached/Not in Server"
            highestRole = "Not Cached/ Not in Server"
        }
        const fetchedFlags = (await user.fetchFlags()).toArray()

        let badges: string[] = []
        for (const badge of fetchedFlags) {
            if (fetchedFlags.length == 0) {
                badges.push("None")
            }
            if (badge == "Staff") badges.push(" <:staff:996115760579620974>")
            if (badge == "Partner") badges.push(" <:PartneredServerOwner:1044190723198697493>")
            if (badge == "Hypesquad") badges.push(" <:HypesquadEvents:1044190722292711464>")
            if (badge == "BugHunterLevel1") badges.push(" <:BugHunterLv1:1044190721197998100>")
            if (badge == "BugHunterLevel2") badges.push(" <:BugHunderLv2:1044190719943913502>")
            if (badge == "HypeSquadOnlineHouse1") badges.push(" <:Bravery:1044190718719164476>")
            if (badge == "HypeSquadOnlineHouse2") badges.push(" <:Brilliance:1044190717876117545>")
            if (badge == "HypeSquadOnlineHouse3") badges.push(" <:Balance:1044190716735275008>")
            if (badge == "PremiumEarlySupporter") badges.push(" <:EarlySupporter:1044190715195957258>")
            if (badge == "VerifiedBot") badges.push(" <:VerifiedBot:1044190727174897726>")
            if (badge == "VerifiedDeveloper") badges.push(" <:EarlyVerifiedBotDeveloper:1044190725237129216>")
            if (badge == "CertifiedModerator") badges.push(" <:CertifiedModerator:1044190723798478870>")
            if (badge == "ActiveDeveloper") badges.push(" <:ActiveDeveloper:1044190726327631942>")
        }

        let userInfoEmbed = new EmbedBuilder()
            .setAuthor({ name: `Who is ${user.tag}`, iconURL: user.displayAvatarURL() || undefined })
            .setThumbnail(user.displayAvatarURL() || null)
            .setColor(color)
            .addFields(
                { name: "Name:", value: `${user.tag}`, inline: true },
                { name: "Badges:", value: `${badges}` },
                {
                    name: "General Information:", value: `**Mention:** <@${user.id}>
                    **ID:** ${user.id}
                    **Is Bot:** ${user.bot}
                    **Highest Role:** ${highestRole}
                    **Avatar:** [View Here](${user.displayAvatarURL({ size: 512 })})
                    **Display Name:** ${nickname}`, inline: false
                },
                { name: "📆 Created:", value: `<t:${Math.floor(user.createdAt?.getTime()! / 1000)}:D> (<t:${Math.floor(user.createdAt?.getTime()! / 1000)}:R>)`, inline: true },
                { name: "📆 Joined:", value: `${joinedAt}`, inline: true }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() || undefined })
        interaction.reply({ embeds: [userInfoEmbed] })

    }
}
