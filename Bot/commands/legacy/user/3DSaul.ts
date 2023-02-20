import { Client, Message } from "discord.js";
import { BooleanCommand } from "../../../interface/BooleanCommand";
let set = new Set()

const command: BooleanCommand = {
	commands: ["3dsaul", "whyarewestillhere"],
	description: "Shhh a secret command",
	commandCategory: "Hidden",
	callback: async (client: Client, message: Message, args: string[]) => {
		if (set.has(message.author.id))
			return;
		message.reply("https://media.discordapp.net/attachments/819578916275617804/977631812413161502/lv_0_20220516161756.mp4");
		set.add(message.author.id);
	},
}

export = command;