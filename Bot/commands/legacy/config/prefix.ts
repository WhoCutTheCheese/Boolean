import { Client, ColorResolvable, EmbedBuilder, Message, TextChannel, PermissionsBitField } from 'discord.js';
import { Utilities } from '../../../utils/Utilities';
import GuildSettings from '../../../schemas/Settings';
import * as config from '../../../config.json'
import { EmbedUtils } from '../../../utils/EmbedUtils';
import Settings from '../../../schemas/Settings';

module.exports = {
	commands: ["setprefix", "prefix", "newprefix"],
	maxArgs: 1,
	expectedArgs: "(prefix)",
	userPermissions: [PermissionsBitField.Flags.ManageGuild],
	cooldown: 10,
	commandCategory: "Config",
	callback: async (client: Client, message: Message, args: string[]) => {
		if (args.length === 0) {
			await Settings.findOneAndUpdate({
				guildID: message.guild?.id
			}, {
				guildSettings: {
					prefix: "!!"
				}
			})

			return new EmbedUtils().sendSuccessEmbed((message.channel as TextChannel), message, { successEmoji: true, replyToMessage: true }, { description: `You reset the prefix to \`!!\`` })
		}

		if (args[0].length > 5) return new EmbedUtils().sendErrorEmbed((message.channel as TextChannel), message, { errorEmoji: true, replyToMessage: true, deleteMsg: true }, { description: `Prefixes can only be 5 characters long!` })
		// message.channel.send({ content: "Prefixes can only be 5 characters long!" })

		await Settings.findOneAndUpdate({
			guildID: message.guild?.id
		}, {
			guildSettings: {
				prefix: args[0]
			}
		})

		new EmbedUtils().sendSuccessEmbed((message.channel as TextChannel), message, { successEmoji: true, replyToMessage: true }, { description: `You set the prefix to \`${args[0]}\`!` })

		// const success = new EmbedBuilder()
		//     .setDescription(`${config.yesEmoji} You set the prefix to \`${args[0]}\`!`)
		//     .setColor(color)
		// message.channel.send({ embeds: [success] })
	}
}