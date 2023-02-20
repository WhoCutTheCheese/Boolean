import { Client, ColorResolvable, EmbedBuilder, Message, User } from "discord.js";
import { BooleanCommand } from "../../../interface/BooleanCommand";
import Settings from "../../../schemas/Settings";
import { Utilities } from "../../../utils/Utilities";

const command: BooleanCommand = {
	commands: ['userinfo', 'ui', 'uinfo', 'memberinfo', 'whois'],
	description: "",
	maxArgs: 1,
	cooldown: 2,
	commandCategory: "User",
	callback: async (client: Client, message: Message, args: string[]) => {

		let color: ColorResolvable = await new Utilities().getEmbedColor(message.guild!)

		let member = message.mentions.members?.first() || await message.guild?.members.fetch(args[0]).catch(() => { });
		let user = await client.users.fetch(args[0]).catch(() => { });

		if (!args[0]) {
			member = message.member!;
			user = message.author;
		}
		if (!user && !member) return message.channel.send({ content: "Unable to fetch that member! Please try again." })
		if (!user && member) {
			user = member.user;
		}

		let nickname = "Not Cached/Not In Server";
		let joinedAt = "Not Cached/Not In Server";
		let highestRole = "Not Cached/Not In Server";

		if (member) {
			if (member.nickname) {
				nickname = member.nickname!;
			} else {
				nickname = (user as User).username;
			}
			joinedAt = `<t:${Math.floor(member.joinedAt?.getTime()! / 1000)}:D> (<t:${Math.floor(member.joinedAt?.getTime()! / 1000)}:R>)`
			highestRole = `<@&${member.roles.highest.id}> (${member.roles.highest.position})`
		}
		const fetchedFlags = (await user!.fetchFlags()).toArray()
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
		if (badges.length == 0) {
			badges.push(`None`);
		}
		let userInfoEmbed = new EmbedBuilder()
			.setAuthor({ name: `Who is ${user!.tag}`, iconURL: user!.displayAvatarURL() || undefined })
			.setThumbnail(user!.displayAvatarURL() || null)
			.setColor(color)
			.addFields(
				{ name: "Name:", value: `${user!.tag}`, inline: true },
				{ name: "Badges:", value: `${badges}` },
				{
					name: "General Information:", value: `**Mention:** <@${user!.id}>
                **ID:** ${user!.id}
                **Is Bot:** ${user!.bot}
                **Highest Role:** ${highestRole}
                **Avatar:** [View Here](${user!.displayAvatarURL({ size: 512 })})
                **Display Name:** ${nickname}`, inline: false
				},
				{ name: "📆 Created:", value: `<t:${Math.floor(user!.createdAt?.getTime()! / 1000)}:D> (<t:${Math.floor(user!.createdAt?.getTime()! / 1000)}:R>)`, inline: true },
				{ name: "📆 Joined:", value: `${joinedAt}`, inline: true }
			)
			.setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
		message.channel.send({ embeds: [userInfoEmbed] }).catch(() => { })
	},
}

export = command;