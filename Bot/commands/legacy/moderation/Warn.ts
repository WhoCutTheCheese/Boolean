import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, ColorResolvable, EmbedBuilder, Message, PermissionsBitField, embedLength, TextChannel, MembershipScreeningFieldType } from 'discord.js';
import { Utilities } from "../../../utils/Utilities";
import Cases from "../../../schemas/Cases";
import { EmbedUtils } from "../../../utils/EmbedUtils";
import { BooleanCommand } from "../../../interface/BooleanCommand";
import { Log, LogLevel } from "../../../utils/Log";
const ms = require("ms");

const command: BooleanCommand = {
	command: "warn",
	aliases: ["warning", "infract"],
	description: "Warn a user",
	minArgs: 1,
	expectedArgs: "[@User/User ID] (Reason)",
	userPermissions: [PermissionsBitField.Flags.ManageMessages],
	botPermissions: [PermissionsBitField.Flags.ModerateMembers],
	commandCategory: "Moderation",
	callback: async (client: Client, message: Message, args: string[]) => {

		const settings = await new Utilities().getGuildSettings(message.guild!); if (!settings) return;

		let color: ColorResolvable = await new Utilities().getEmbedColor(message.guild!);

		const user = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
		if (!user) return message.channel.send({ content: "Unable to fetch that member! Please try again." });

		let reason = args.splice(1).join(" ") || "No reason provided.";
		if (reason.length > 250) return message.channel.send({ content: "Punishment reason cannot exceed 250 characters." })

		if (user.id === message.author.id) return message.channel.send({ content: "You cannot issue warnings to yourself!" });
		if (user.id === message.guild?.ownerId) return message.channel.send({ content: "You cannot issue warnings to this user!" });
		if (user.id === client.user?.id) return message.channel.send({ content: "You cannot warn me. My power levels are too high!" });

		const warns = await new Utilities().warnCount(user.user);

		const caseNumberSet = await new Utilities().incrementCaseCount(message.guild!);

		let remainder = 1;
		let warnsBeforeMute = settings.modSettings?.warnsBeforeMute ?? 3;

		if (warns != 0) {
			remainder = warns % warnsBeforeMute!;
		}
		if (settings.modSettings?.warnsBeforeMute == 0) {
			remainder = 1
		}
		if (!caseNumberSet) return message.channel.send({ content: "An error occurred, if this error persists please contact support." })

		if (remainder == 0 && message.guild?.members.me?.roles.highest.position! > user.roles.highest.position && message.guild?.members.me?.permissions.has([PermissionsBitField.Flags.ModerateMembers])) {

			const newCase = new Cases({
				guildID: message.guild.id,
				userID: user.id,
				modID: message.author.id,
				caseID: caseNumberSet,
				action: "AutoMute",
				caseDetails: {
					reason: reason,
					length: "10 Minutes",
					date: Date.now(),
				}
			})
			newCase.save().catch((err: Error) => { Log(LogLevel.Error, "An error occurred in legacy/moderation/Warn.ts\n\n" + err) })

			if (settings.modSettings?.dmOnPunish == true) {
				const dm = new EmbedBuilder()
					.setAuthor({ name: "You have been muted in " + message.guild?.name + "!", iconURL: message.guild?.iconURL() || undefined })
					.setColor(color)
					.setDescription(`<:blurple_bulletpoint:997346294253244529> **Reason:** ${reason} Automatic mute due to excess warnings!
					<:blurple_bulletpoint:997346294253244529> **Duration:** 10 Minutes
					<:blurple_bulletpoint:997346294253244529> **Case:** #${caseNumberSet}`)
					.setTimestamp()
				if (settings.guildSettings?.premium == false || !settings.guildSettings?.premium) {
					user.send({ embeds: [dm], components: [new EmbedUtils().getInviteButton()] })
				} else if (settings.guildSettings?.premium == true) {
					user.send({ embeds: [dm] })
				}
			}

			await new EmbedUtils().sendModerationSuccessEmbed((message.channel as TextChannel), message, { arrowEmoji: true, replyToMessage: true }, {
				mod: message.member!, user, caseNumberSet,
				reason,
				duration: "10 Minutes",
				customContent: `**${user.user.tag}** has been automatically muted! (Warns **${warns}**)`
			})

			// const autoMuted = new EmbedBuilder()
			// 	.setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason} | **Duration:** 10 Minutes`)
			// 	.setColor(color)
			// message.channel.send({ content: `<:arrow_right:967329549912248341> `, embeds: [autoMuted] })

			new EmbedUtils().sendModLogs(
				{
					guild: message.guild,
					mod: message.member!,
					target: user,
				},
				{ title: "User Auto-Muted", actionInfo: `**Reason:** ${reason}\n> **Duration:** 10 Minutes\n> **Case ID:** ${caseNumberSet}` }
			);
			user.timeout(ms("10m"), reason)
			return;
		}

		const newCase = new Cases({
			guildID: message.guild?.id,
			userID: user.id,
			modID: message.author.id,
			caseID: caseNumberSet,
			action: "Warn",
			caseDetails: {
				reason: reason,
				date: Date.now(),
				length: "Infinite"
			}
		})
		newCase.save().catch((err: Error) => { Log(LogLevel.Error, "An error occurred in legacy/moderation/Warn.ts\n\n" + err) })

		if (settings.modSettings?.dmOnPunish == true) {
			const dm = new EmbedBuilder()
				.setAuthor({ name: "You have been warned in " + message.guild?.name + "!", iconURL: message.guild?.iconURL() || undefined })
				.setColor(color)
				.setDescription(`<:blurple_bulletpoint:997346294253244529> **Reason:** ${reason}
				<:blurple_bulletpoint:997346294253244529> **Case:** #${caseNumberSet}`)
				.setTimestamp()
			if (settings.guildSettings?.premium == false || !settings.guildSettings?.premium) {
				user.send({ embeds: [dm], components: [new EmbedUtils().getInviteButton()] }).catch((err: Error) => {
					Log(LogLevel.Error, "An error occurred in legacy/moderation/Warn.ts\n\n" + err)
				})
			} else if (settings.guildSettings?.premium == true) {
				user.send({ embeds: [dm] }).catch((err: Error) => {
					Log(LogLevel.Error, "An error occurred in legacy/moderation/Warn.ts\n\n" + err)
				})
			}
		}

		await new EmbedUtils().sendModerationSuccessEmbed((message.channel as TextChannel), message, { arrowEmoji: true, replyToMessage: true }, { mod: message.member!, user, caseNumberSet, reason, customContent: `**${user.user.tag}** has been warned! (Warns **${warns}**)` })

		// const warned = new EmbedBuilder()
		// 	.setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
		// 	.setColor(color)
		// message.channel.send({ content: `<:arrow_right:967329549912248341> `, embeds: [warned] })

		new EmbedUtils().sendModLogs(
			{
				guild: message.guild!,
				mod: message.member!,
				target: user,
			},
			{ title: "User Warned", actionInfo: `**Reason:** ${reason}\n> **Case ID:** ${caseNumberSet}` }
		);

	}
}

export = command;