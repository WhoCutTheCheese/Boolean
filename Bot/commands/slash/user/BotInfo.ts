import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Client, ColorResolvable, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Utilities } from "../../../utils/Utilities";
const bot = require("../../../package.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("botinfo")
		.setDescription("Get information on Boolean.")
		.setDMPermission(false),
	async execute(interaction: ChatInputCommandInteraction, client: Client) {
		if (!interaction.inCachedGuild()) return interaction.reply({ content: "You must be inside a cached guild to use this command!", ephemeral: true })

		let color: ColorResolvable = await new Utilities().getEmbedColor(interaction.guild!)

		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setLabel("Invite Me!")
					.setStyle(ButtonStyle.Link)
					.setURL("https://discord.com/oauth2/authorize?client_id=966634522106036265&permissions=307089505783&scope=bot%20applications.commands")
			)

		const botInfo = new EmbedBuilder()
			.setAuthor({ name: "Boolean Info", iconURL: client.user?.displayAvatarURL() || undefined })
			.setColor(color)
			.addFields(
				{ name: "<:discovery:996115763842785370> Name:", value: `\`${client.user?.tag}\``, inline: true },
				{ name: "<:stage:996115761703702528> Team:", value: `\`Creator:\` TehCheese#1075\n\`Contributors:\` ${bot.contributors.join(", ").trim()}`, inline: true },
				{ name: "<:CertifiedModerator:1044190723798478870> Guilds:", value: `\`${client.guilds.cache.size.toLocaleString()}\``, inline: true },
				{ name: "<:gears:996115762848747530> Created:", value: `<t:${Math.floor(client.user!.createdAt.getTime() / 1000)}:D>`, inline: true },
				{ name: "<:staff:996115760579620974> Version:", value: `\`v${bot.version}\``, inline: true },
				{ name: "<:thread:996116357269692526> Library:", value: "`discord.js`", inline: true },
			)
			.setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() || undefined })
		interaction.reply({ embeds: [botInfo], components: [row] })
	}
}