import { ChatInputCommandInteraction, Client, Message, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("invite")
		.setDescription("Vote for, or invite Boolean to your server."),
	async execute(interaction: ChatInputCommandInteraction, client: Client) {

		const actionRow = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setStyle(ButtonStyle.Link)
					.setEmoji("🔗")
					.setLabel("Invite Me!")
					.setURL("https://discord.com/api/oauth2/authorize?client_id=966634522106036265&permissions=1392307989702&scope=bot%20applications.commands"),
				new ButtonBuilder()
					.setStyle(ButtonStyle.Link)
					.setEmoji("🔗")
					.setLabel("Support Server!")
					.setURL("https://discord.gg/G2EhQCZZfh"),
				new ButtonBuilder()
					.setStyle(ButtonStyle.Link)
					.setEmoji("🔗")
					.setLabel("Top.gg")
					.setURL("https://top.gg/bot/966634522106036265"),
				new ButtonBuilder()
					.setStyle(ButtonStyle.Link)
					.setEmoji("🔗")
					.setLabel("DBL.com")
					.setURL("https://discordbotlist.com/bots/boolean")
			)

		const inviteEmbed = new EmbedBuilder()
			.setAuthor({ name: "Invite Boolean!", iconURL: client.user?.displayAvatarURL() || undefined })
			.setColor("Blurple")
			.setDescription(`Boolean is a in-depth moderation bot that can keep your server safe and give your moderators everything they need.
            Help support Boolean by voting with the links below.`)
			.setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() || undefined })
		interaction.reply({ embeds: [inviteEmbed], components: [actionRow] })

	}
}