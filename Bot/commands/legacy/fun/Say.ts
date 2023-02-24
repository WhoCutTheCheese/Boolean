import { Client, Message, parseEmoji, PermissionsBitField, TextChannel } from "discord.js";
import { BooleanCommand } from "../../../interface/BooleanCommand";
import { Log } from "../../../utils/Log";
import { EmbedType, EmbedUtils } from '../../../utils/EmbedUtils';
import { underline } from 'colors';
import { Utilities } from "../../../utils/Utilities";

const command: BooleanCommand = {
	command: "say",
	aliases: ["chat", "talk"],
	description: "Make the bot say a message",
	expectedArgs: "[channel] (message)",
	minArgs: 1,
	userPermissions: [PermissionsBitField.Flags.Administrator],
	commandCategory: "Fun",
	callback: async (client: Client, message: Message, args: string[]) => {
		let channel = message.mentions.channels?.first() || await message.guild?.channels.cache.get(args[0]) || null;
		let msg = channel ? args.slice(1).join(" ") : args.join(" ");
		if (msg.trim() === "") return new EmbedUtils().sendEmbed(EmbedType.error, (message.channel as TextChannel), { message: message, replyToMessage: true, deleteMsg: true }, { description: "A message is required" })

		channel = (channel as TextChannel || message.channel as TextChannel)
		message.react(new Utilities().getConfig().yesEmoji)

		try {
			await channel.send({ content: msg })
		} catch (err) { }
	},
}

export = command;

