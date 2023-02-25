import { Client, Message, parseEmoji, PermissionsBitField, TextChannel } from "discord.js";

import { BooleanCommand } from "../../../interface/BooleanCommand";
import { EmbedUtils, EmbedType } from '../../../utils/EmbedUtils';
import { Log } from "../../../utils/Log";
let set = new Set()

const command: BooleanCommand = {
	command: "stealemoji",
	aliases: ["steal"],
	description: "Steal an emoji and put it in your server",
	expectedArgs: "(emoji) [name]",
	minArgs: 1,
	botPermissions: [PermissionsBitField.Flags.ManageEmojisAndStickers],
	userPermissions: [PermissionsBitField.Flags.ManageEmojisAndStickers],
	commandCategory: "Fun",
	callback: async (client: Client, message: Message, args: string[]) => {


		const parsedEmoji = parseEmoji(args[0])
		if (!parsedEmoji || !parsedEmoji.id) return new EmbedUtils().sendEmbed(EmbedType.error, message.channel, { emoji: true }, { description: "That emoji is not valid!" });
		let name = args.splice(1).join(" "); if (name.trim() === "") name = parsedEmoji.name
		if (name.length > 32) return new EmbedUtils().sendEmbed(EmbedType.error, message.channel, { emoji: true }, { description: "Name must be under 32 characters" });

		const extention = parsedEmoji.animated ? ".gif" : ".png"
		const url = `https://cdn.discordapp.com/emojis/${parsedEmoji.id}${extention}`;
		await message.guild?.emojis.create({ name, attachment: url, reason: `Stolen by ${message.author.tag}` })
		new EmbedUtils().sendEmbed(EmbedType.success, message.channel, { emoji: true }, { title: "Thief!", description: `Successfully stole & added \`${url}\` under name: \`${name}\`` })
		// message.channel.send({ content: `Successfully stole & added \`${url}\` under name: ${name}` })
	},
}

export = command;

