import { ChatInputCommandInteraction, Client, Message, SlashCommandBuilder } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Get Boolean's latency and Discord API latency."),
	async execute(interaction: ChatInputCommandInteraction, client: Client) {
		const resultMessage: Message = await interaction.reply({ content: "🔃 Calculating...", fetchReply: true })
		const ping = resultMessage.createdTimestamp - interaction.createdTimestamp
		interaction.editReply({ content: `<:check:1069088768830738554> Bot Latency: **${ping}ms**, API Latency: **${client.ws.ping}ms**` })
	}
}