import { Client, Message, TextChannel, Embed } from 'discord.js';
import { BooleanCommand } from "../../../interface/BooleanCommand";
import { EmbedType, EmbedUtils } from '../../../utils/EmbedUtils';
import { Log } from '../../../utils/Log';
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
		if (args.length === 0) return new EmbedUtils().sendArgsErrorEmbed(message, 1, exports)

		const commandName = args[0].trim().toLowerCase();
		let commandpath = client.legacycommandfilepath.get(commandName)! || client.legacycommandfilepath.get(client.legacycommandalias.get(commandName)!)!
		if (!commandpath) return new EmbedUtils().sendEmbed(EmbedType.error, message.channel, { message: message, replyToMessage: true, deleteMsg: true }, { title: "Unknown command", description: "That command does not exist" })
		let command = client.legacycommands.get(commandName)! || client.legacycommands.get(client.legacycommandalias.get(commandName)!)!

		Log.info(`[Loading] | Legacy Command | ${command.command}`)

		let loaded = await new Utilities().loadCommand(client, commandpath)

		if (loaded) {
			Log.info(`[Loaded]  | Legacy Command | ${command.command}`)
			return new EmbedUtils().sendEmbed(EmbedType.success, message.channel, { message: message, emoji: true, replyToMessage: true }, { description: `Successfully reloaded \`${command.command}\`` })
		}
		else {
			Log.error(`There was an error loading ${command.command}`)
			return new EmbedUtils().sendEmbed(EmbedType.error, message.channel, { message: message, emoji: true, replyToMessage: true }, { description: `There was an error reloading \`${command.command}\`` })
		}
	},
}

export = command;