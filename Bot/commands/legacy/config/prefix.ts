import { Client, Message, TextChannel, PermissionsBitField } from 'discord.js';
import { EmbedType, EmbedUtils } from '../../../utils/EmbedUtils';
import Settings from '../../../schemas/Settings';
import { BooleanCommand } from '../../../interface/BooleanCommand';

const command: BooleanCommand = {
	command: "setprefix",
	aliases: ["prefix", "newprefix"],
	description: "Set the prefix",
	maxArgs: 1,
	expectedArgs: "(prefix)",
	userPermissions: [PermissionsBitField.Flags.ManageGuild],
	cooldown: 10,
	commandCategory: "Config",
	callback: async (client: Client, message: Message, args: string[]) => {
		if (args.length === 0 || args[0] === "!!") {
			await Settings.findOneAndUpdate({
				guildID: message.guild?.id
			}, {
				guildSettings: {
					prefix: "!!"
				}
			});

			return new EmbedUtils().sendEmbed(EmbedType.success, message.channel, { message: message, emoji: true, replyToMessage: true }, { description: `You reset the prefix to \`!!\`` });
		}

		if (args[0].length > 5)
			return new EmbedUtils().sendEmbed(EmbedType.error, message.channel, { message: message, emoji: true, replyToMessage: true, deleteMsg: true }, { description: `Prefixes can only be 5 characters long!` });

		await Settings.findOneAndUpdate({
			guildID: message.guild?.id
		}, {
			guildSettings: {
				prefix: args[0]
			}
		});

		new EmbedUtils().sendEmbed(EmbedType.success, message.channel, { message: message, emoji: true, replyToMessage: true }, { description: `You set the prefix to \`${args[0]}\`!` });
	},
}

export = command