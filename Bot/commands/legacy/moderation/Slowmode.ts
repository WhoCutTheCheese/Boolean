import { EmbedUtils } from "../../../utils/EmbedUtils";
import { Client, EmbedBuilder, Message, PermissionsBitField, TextChannel, messageLink, Utils, Channel, GuildBasedChannel } from 'discord.js';
import { BooleanCommand } from "../../../interface/BooleanCommand";
import { Utilities } from '../../../utils/Utilities';

const command: BooleanCommand = {
	command: "slowmode",
	aliases: ["sm"],
	description: "Turn on and set slowmode for a channel",
	maxArgs: 2,
	cooldown: 2,
	expectedArgs: "[channel] (Seconds)",
	botPermissions: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ViewChannel],
	userPermissions: [PermissionsBitField.Flags.ManageChannels],
	commandCategory: "Moderation",
	callback: async (client: Client, message: Message, args: string[]) => {
		let channel = message.mentions.channels?.first() || await message.guild?.channels.cache.get(args[0]) || null;

		let getLenthFromString = new Utilities().getLenthFromString(channel ? args[1] : args[0]);
		if (!getLenthFromString) return new EmbedUtils().sendErrorEmbed((message.channel as TextChannel), message, { errorEmoji: true, replyToMessage: true, deleteMsg: true }, { description: `Invalid time provided` });
		let [length, lengthString] = getLenthFromString

		if (length < 0) return new EmbedUtils().sendErrorEmbed((message.channel as TextChannel), message, { errorEmoji: true, replyToMessage: true, deleteMsg: true }, { description: `Slowmode must be at least 1 second!` });
		if (length > 21600) return new EmbedUtils().sendErrorEmbed((message.channel as TextChannel), message, { errorEmoji: true, replyToMessage: true, deleteMsg: true }, { description: `Slowmode must be under 6 hours!` });

		channel = (channel as TextChannel || message.channel as TextChannel)

		try {
			await channel.setRateLimitPerUser(length, `Slowmode set by ${message.author.tag}`);
			new EmbedUtils().sendSuccessEmbed((message.channel as TextChannel), message, { successEmoji: true, replyToMessage: true }, { title: "Set slowmode", description: `Slowmode set to **${lengthString}**` });
			new EmbedUtils().sendModLogs({ guild: message.guild!, mod: message.member!, action: "Channel Slowmode" }, { title: "Channel slowmode", channel: channel, actionInfo: `**Duration:** ${lengthString}` })
		} catch (err) { }
	},
};

export = command;
