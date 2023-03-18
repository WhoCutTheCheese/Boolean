import { EmbedType, EmbedUtils } from "../../../utils/EmbedUtils";
import { Client, EmbedBuilder, Message, PermissionsBitField, TextChannel, messageLink, Utils, Channel, GuildBasedChannel, User } from 'discord.js';
import { BooleanCommand } from "../../../interface/BooleanCommand";
import { Utilities } from '../../../utils/Utilities';
import { Log } from "../../../utils/Log";
import Bans from "../../../schemas/Bans";

const command: BooleanCommand = {
	command: "ban",
	aliases: ["tempban", "remove"],
	description: "Ban a user from the server",
	minArgs: 1,
	cooldown: 2,
	expectedArgs: "(user) [length] [reason]",
	botPermissions: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ViewChannel],
	userPermissions: [PermissionsBitField.Flags.ManageChannels],
	commandCategory: "Moderation",
	callback: async (client: Client, message: Message, args: string[]) => {
		const member = message.mentions.members?.first() || await message.guild?.members.cache.get(args[0]) || await message.guild?.members.cache.find(m => m.user.username.toLowerCase() === args[0] || m.nickname?.toLowerCase() === args[0] || m.user.username.toLowerCase().includes(args[0]) || (m.nickname && m.nickname.toLowerCase().includes(args[0])));

		let user = member ? member.user : await client.users.fetch(args[0]).catch(() => { });

		if (!user) {
			return new EmbedUtils().sendEmbed(EmbedType.error, message.channel, { deleteMsg: true, emoji: true }, { description: "Invalid user" });
		}

		if (user.id === message.author.id) return new EmbedUtils().sendEmbed(EmbedType.error, message.channel, { message: message, emoji: true, replyToMessage: true, deleteMsg: true }, { description: `You cannot ban yourself!` });
		if (user.id === message.guild?.ownerId) return new EmbedUtils().sendEmbed(EmbedType.error, message.channel, { message: message, emoji: true, replyToMessage: true, deleteMsg: true }, { description: `This user is unable to be banned!` });
		if (user.id === client.user?.id) return new EmbedUtils().sendEmbed(EmbedType.error, message.channel, { message: message, emoji: true, replyToMessage: true, deleteMsg: true }, { description: `You cannot ban me. My power levels are too high!` });

		let caseNumber = await new Utilities().incrementCaseCount(message.guild!);
		if (!caseNumber) return new EmbedUtils().sendEmbed(EmbedType.error, message.channel, {}, { title: "Fatal error", description: "There was an error getting a case number", footer: { text: `Please contact boolean developers about this! (${await new Utilities().getGuildPrefix(message.guild!) || "!!"}support)` } });
		let getLengthFromString = new Utilities().getLengthFromString(args[1]);
		let [lengthNum, lengthString] = getLengthFromString;
		let reason = lengthNum ? args.splice(2).join(" ") : args.splice(1).join(" ");

		if (reason.trim() === "") reason = "No reason provided";
		if (!lengthString) lengthString = "Forever";

		await message.guild?.members.ban(user, { reason: `Banned by ${message.author.tag}\nReason: ${reason}` });
		if ((lengthNum && lengthNum > 0)) {
			Log.debug(`created ban file for ${user.tag}`);
			await Bans.create({ guildID: message.guild?.id, userID: user.id, banExpireUnix: (Math.floor(Date.now() / 1000) + lengthNum), caseNumber: caseNumber! });
		} else {
			await Bans.deleteMany({
				userID: user.id
			});
		}

		await new EmbedUtils().sendModLogs({ guild: message.guild!, mod: message.member!, targetUser: user, action: "Ban" }, { title: "User Banned", actionInfo: `**Reason:** ${reason}\n> **Duration:** ${lengthString}\n> **Case ID:** ${caseNumber}`, channel: message.channel });

		return new EmbedUtils().sendModerationSuccessEmbed((message.channel as TextChannel), message, { arrowEmoji: true }, { mod: message.member!, caseNumberSet: caseNumber!, reason: reason, duration: lengthString, customContent: `**${user.tag}** has been banned` });
	},
};

export = command;
