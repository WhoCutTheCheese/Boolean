import { Client, Message, parseEmoji, PermissionsBitField, TextChannel } from "discord.js";
import { BooleanCommand } from "../../../interface/BooleanCommand";
import { Log } from "../../../utils/Log";

const command: BooleanCommand = {
	command: "say",
	aliases: ["chat", "talk"],
	description: "Make the bot say a message",
	minArgs: 1,
	userPermissions: [PermissionsBitField.Flags.Administrator],
	commandCategory: "Fun",
	callback: async (client: Client, message: Message, args: string[]) => {
		let channel = message.mentions.channels?.first() || await message.guild?.channels.cache.get(args[0]) || null;
		let msg = channel ? args.slice(1).join(" ") : args.join(" ");
		(channel as TextChannel || message.channel as TextChannel).send({ content: msg })
	},
}

export = command;

