import { EmbedUtils } from "../../../utils/EmbedUtils";
import { Client, EmbedBuilder, Message, PermissionsBitField, TextChannel, messageLink, Utils } from 'discord.js';
import { BooleanCommand } from "../../../interface/BooleanCommand";
import { Utilities } from '../../../utils/Utilities';

const command: BooleanCommand = {
	command: "slowmode",
	aliases: ["sm"],
	description: "Turn on and set slowmode for a channel",
	minArgs: 1,
	maxArgs: 2,
	cooldown: 2,
	expectedArgs: "[channel] (Seconds)",
	botPermissions: [PermissionsBitField.Flags.BanMembers],
	userPermissions: [PermissionsBitField.Flags.BanMembers],
	commandCategory: "Moderation",
	callback: async (client: Client, message: Message, args: string[]) => {
		if (!message.guild?.members.me?.permissions.has(PermissionsBitField.Flags.ManageChannels)) return new EmbedUtils().sendErrorEmbed((message.channel as TextChannel), message, { errorEmoji: true, replyToMessage: true, deleteMsg: true }, { description: `I cannot edit slowmode!` })

		let lengthString = args[0]
		if (Number(args[0])) lengthString = `${args[0]}s`
		let length = new Utilities().conertStringToTime(lengthString, 's')
		if (!length) return new EmbedUtils().sendErrorEmbed((message.channel as TextChannel), message, { errorEmoji: true, replyToMessage: true, deleteMsg: true }, { description: `Invalid time provided` });
		lengthString = new Utilities().convertShortToLongTime(lengthString)

		if (length < 0) return new EmbedUtils().sendErrorEmbed((message.channel as TextChannel), message, { errorEmoji: true, replyToMessage: true, deleteMsg: true }, { description: `Slowmode must be at least 1 second!` });
		if (length > 21600) return new EmbedUtils().sendErrorEmbed((message.channel as TextChannel), message, { errorEmoji: true, replyToMessage: true, deleteMsg: true }, { description: `Slowmode must be under 6 hours!` });

		(message.channel as TextChannel).setRateLimitPerUser(length, `Slowmode set by ${message.author.tag}`).catch((err: Error) => console.error(err));
		new EmbedUtils().sendSuccessEmbed((message.channel as TextChannel), message, { successEmoji: true, replyToMessage: true }, { title: "Set slowmode", description: `Slowmode set to **${lengthString}**` });
		new EmbedUtils().sendModLogs({ guild: message.guild, mod: message.member!, action: "Channel Slowmode" }, { title: "Channel slowmode", channel: message.channel, actionInfo: `**Duration:** ${lengthString}` })
	},
};
export = command;
