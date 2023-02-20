import { Client, ColorResolvable, EmbedBuilder, Message, TextChannel, PermissionsBitField } from 'discord.js';
import { Utilities } from '../../../utils/Utilities';
import GuildSettings from '../../../schemas/Settings';
import * as config from '../../../config.json'
import { EmbedUtils } from '../../../utils/EmbedUtils';
import { BooleanCommand } from '../../../interface/BooleanCommand';

const command: BooleanCommand = {
	commands: ["setmodlog", "setmodlogs", "modlog", "modlogs"],
	description: "Set the mod logging channel",
	minArgs: 1,
	maxArgs: 2,
	expectedArgs: "[Set/Reset/View] [@Channel/Channel ID]",
	subCommands: ["set", "reset", "view"],
	userPermissions: [PermissionsBitField.Flags.ManageGuild],
	cooldown: 5,
	commandCategory: "Configuration",
	callback: async (client: Client, message: Message, args: string[]) => {

		let settings = await new Utilities().getGuildSettings(message.guild);
		if (!settings)
			return;
		let color: ColorResolvable = await new Utilities().getEmbedColor(message.guild);

		const channel = message.mentions.channels.first() || message.guild?.channels.cache.get(args[1]);

		switch (args[0].toLowerCase()) {
			case "set":

				if (!channel)
					return message.channel.send({ content: "Invalid channel! Ex. `!!modlogs set #Channel`" });

				await GuildSettings.findOneAndUpdate({
					guildID: message.guild?.id
				}, {
					modSettings: {
						modLogChannel: channel.id
					}
				});

				new EmbedUtils().sendSuccessEmbed(message.channel as TextChannel, message, { successEmoji: true, replyToMessage: true }, { description: `You set the mod logging channel to \`#${(channel as TextChannel).name}\`!` });

				break;
			case "reset":

				await GuildSettings.findOneAndUpdate({
					guildID: message.guild?.id
				}, {
					modSettings: {
						$unset: { modLogChannel: "" }
					}
				});

				new EmbedUtils().sendSuccessEmbed(message.channel as TextChannel, message, { successEmoji: true, replyToMessage: true }, { description: `ModLog channel has been reset` });

				break;
			case "view":
				let channelE;
				if (!settings.modSettings?.modLogChannel) {
					channelE = "None";
				} else {
					channelE = `<#${settings.modSettings?.modLogChannel}>`;
				}

				const view = new EmbedBuilder()
					.setTitle("Mod Log Channel")
					.setColor(color)
					.setDescription(`**Current Channel:** ${channelE}`)
					.setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined });
				message.channel.send({ embeds: [view] });

				break;
			default: {
				new EmbedUtils().sendArgsErrorEmbed(message, 1, module.exports);
			}
		}

	},
}

export = command