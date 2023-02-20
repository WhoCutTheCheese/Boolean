import { Client, Message, TextChannel, Embed } from 'discord.js';
import { BooleanCommand } from "../../../interface/BooleanCommand";
import { EmbedUtils } from '../../../utils/EmbedUtils';
import { Log, LogLevel } from '../../../utils/Log';
import { Utilities } from '../../../utils/Utilities';

const command: BooleanCommand = {
	command: 'reload',
	aliases: ['rl'],
	description: "Reload a command",
	commandCategory: "Hidden",
	minArgs: 1,
	maxArgs: 1,
	expectedArgs: "(cmd/alias)",
	devOnly: true,
	callback: async (client: Client, message: Message, args: string[]) => {
		if (args.length === 0) {
			return new EmbedUtils().sendArgsErrorEmbed(message, 1, exports)
		}

		const commandName = args[0].trim().toLowerCase();
		let commandpath = client.legacycommandfilepath.get(commandName)! || client.legacycommandfilepath.get(client.legacycommandalias.get(commandName)!)!
		if (!commandpath) return new EmbedUtils().sendErrorEmbed((message.channel as TextChannel), message, { errorEmoji: false, replyToMessage: true, deleteMsg: true }, { title: "Unknown command", description: "That command does not exist" })
		let command = client.legacycommands.get(commandName)! || client.legacycommandfilepath.get(client.legacycommandalias.get(commandName)!)!

		let loaded = await new Utilities().loadCommand(client, commandpath)
		if (loaded) return new EmbedUtils().sendSuccessEmbed((message.channel as TextChannel), message, { successEmoji: true, replyToMessage: true }, { description: `Successfully reloaded \`${command.command}\`` })
		else return new EmbedUtils().sendErrorEmbed((message.channel as TextChannel), message, { errorEmoji: true, replyToMessage: true, deleteMsg: true }, { description: `There was an error reloading \`${command.command}\`` })
	},
}

export = command;