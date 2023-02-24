import { Utilities } from "../../../utils/Utilities";
import { EmbedType, EmbedUtils } from "../../../utils/EmbedUtils";
import { Client, ColorResolvable, EmbedBuilder, Message, PermissionsBitField, TextChannel } from 'discord.js';
import { BooleanCommand } from "../../../interface/BooleanCommand";
import { Log, LogLevel } from '../../../utils/Log';

const command: BooleanCommand = {
	command: "softban",
	aliases: ["sb"],
	description: "Ban and delete messages from past 7 days then unban the user immeditly.",
	minArgs: 1,
	cooldown: 2,
	expectedArgs: "[@User/User ID] (Delete Days) (Reason)",
	botPermissions: [PermissionsBitField.Flags.BanMembers],
	userPermissions: [PermissionsBitField.Flags.BanMembers],
	commandCategory: "Moderation",
	callback: async (client: Client, message: Message, args: string[]) => {
		if (!message.guild?.members?.me) {
			message.channel.send({ content: "This command can only be used in a guild", });
			return;
		}

		const member = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
		if (!member) return new EmbedUtils().sendEmbed(EmbedType.error, (message.channel as TextChannel), { message: message, emoji: true, replyToMessage: true, deleteMsg: true }, { description: `I was unable to find that member!` })

		if (member.id === message.author.id) return new EmbedUtils().sendEmbed(EmbedType.error, (message.channel as TextChannel), { message: message, emoji: true, replyToMessage: true, deleteMsg: true }, { description: `You cannot ban yourself!` })
		if (member.id === message.guild?.ownerId) return new EmbedUtils().sendEmbed(EmbedType.error, (message.channel as TextChannel), { message: message, emoji: true, replyToMessage: true, deleteMsg: true }, { description: `You cannot ban this user!` })
		if (member.id === client.user?.id) return new EmbedUtils().sendEmbed(EmbedType.error, (message.channel as TextChannel), { message: message, emoji: true, replyToMessage: true, deleteMsg: true }, { description: `You cannot ban me. My power levels are too high!` })
		if (member) {
			if (message.guild.members.me.roles.highest.position < member.roles.highest.position) return new EmbedUtils().sendEmbed(EmbedType.error, (message.channel as TextChannel), { message: message, emoji: true, replyToMessage: true, deleteMsg: true }, { description: `This member is above me! I cannot ban them.` })
		}

		const caseNumberSet = await new Utilities().incrementCaseCount(message.guild)

		let length = isNaN(Number(args[1])) ? 7 : Number(args[1])
		let reason = isNaN(Number(args[1])) ? args.slice(1).join(" ") : args.slice(2).join(" ")

		if (reason.length > 250) return message.channel.send({ content: "Reason exceeds maximum length! (250 Characters)" })
		if (length > 7) return message.channel.send({ content: "You cannot delete messages past 7 days." })
		if (length <= 0) return message.channel.send({ content: "You cannot delete messages less than 1 day." })

		await member.ban({ reason: reason, deleteMessageDays: length }).catch((err: Error) => new Utilities().handleError(err));
		await message.guild.members.unban(member!.id, "Soft-Ban").catch((err: Error) => new Utilities().handleError(err))

		await new EmbedUtils().sendModerationSuccessEmbed((message.channel as TextChannel), message, { arrowEmoji: true, replyToMessage: true }, {
			mod: message.member!,
			user: member,
			caseNumberSet: caseNumberSet!,
			reason,
			customContent: `**${member.user.tag}** has been Soft-Banned!`
		})
		await new EmbedUtils().sendModLogs({ guild: message.guild, mod: message.member!, target: member, action: "Soft-Ban" }, { title: "User Soft-Banned", actionInfo: `**Reason:** ${reason}\n> **Duration:** ${length} Days\n> **Case ID:** ${caseNumberSet}`, channel: message.channel })
		// new Punishment({ type: PunishTypes.SoftBan, user: member.user, member: member, message: message, settings: settings, color: color, caseNumberSet: caseNumberSet, reason: reason, warns: warns, deleteDays: 7 })
	},
};

export = command;