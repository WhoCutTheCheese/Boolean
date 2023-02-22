import { underline } from "colors";
import { Client, Message, parseEmoji, PermissionsBitField, TextChannel } from "discord.js";

import { BooleanCommand } from "../../../interface/BooleanCommand";
import { EmbedUtils } from "../../../utils/EmbedUtils";
let set = new Set()

const command: BooleanCommand = {
	command: "stealemoji",
	aliases: ["steal"],
	description: "Steal an emoji and put it in your server",
	botPermissions: [PermissionsBitField.Flags.ManageEmojisAndStickers],
	userPermissions: [PermissionsBitField.Flags.ManageEmojisAndStickers],
	commandCategory: "Fun",
	callback: async (client: Client, message: Message, args: string[]) => {
		if (!args.length) return new EmbedUtils().sendErrorEmbed((message.channel as TextChannel), message, { errorEmoji: true, replyToMessage: true, deleteMsg: true }, { description: `No emojis provided` });

		for (const rawEmoji of args) {
			const parsedEmoji = parseEmoji(rawEmoji)
			if (!parsedEmoji || !parsedEmoji.id) continue;

			const extention = parsedEmoji.animated ? ".gif" : ".png"
			const url = `https://cdn.discordapp.com/emojis/${parsedEmoji.id}${extention}`;
			await message.guild?.emojis.create({ name: parsedEmoji.name, attachment: url, reason: `Stolen by ${message.author.tag}` })
			message.channel.send({ content: `Successfully stole & added \`${url}\`` })
		}
	},
}

export = command;

