import { Client, Message, TextChannel, PermissionsBitField, EmbedBuilder, ButtonBuilder, Emoji, ActionRowBuilder, ButtonStyle, ComponentBuilder } from 'discord.js';
import { EmbedType, EmbedUtils } from '../../../utils/EmbedUtils';
import Settings from '../../../schemas/Settings';
import { BooleanCommand } from '../../../interface/BooleanCommand';
import { Utilities } from '../../../utils/Utilities';

const command: BooleanCommand = {
	command: "dashboard",
	aliases: ["dash", "config"],
	description: "Gives the link to the dashboard",
	maxArgs: 1,
	expectedArgs: "(prefix)",
	userPermissions: [PermissionsBitField.Flags.ManageGuild],
	cooldown: 10,
	commandCategory: "Config",
	callback: async (client: Client, message: Message, args: string[]) => {
		const dashboardButton = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setLabel("Dashboard")
					// .setURL(`https://google.com`)
					.setURL(`https://booleanbot.cc/manage/${message.guild!.id!}`)
					.setStyle(ButtonStyle.Link),
			);

		let dashboardEmbed = new EmbedBuilder()
			.setTitle("Server Dashboard")
			.setDescription("Click the button below to go to the dashboard")
			.setColor(await new Utilities().getEmbedColor(message.guild!))

		await (message.channel as TextChannel).send({ embeds: [dashboardEmbed], components: [dashboardButton] })
	},
}

export = command