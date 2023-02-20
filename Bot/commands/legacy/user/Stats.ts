import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js"
import { BooleanCommand } from "../../../interface/BooleanCommand";
import Settings from "../../../schemas/Settings";
import { Utilities } from "../../../utils/Utilities";

const command: BooleanCommand = {
	commands: ['stats', 'ram'],
	description: "The bot's server stats",
	commandCategory: "User",
	cooldown: 3,
	callback: async (client: Client, message: Message, args: string[]) => {

		let color: ColorResolvable = await new Utilities().getEmbedColor(message.guild!);

		const reply = message.channel.send({ content: "Fetching stats..." });

		const embed = new EmbedBuilder()
			.setAuthor({ name: `${client.user?.username} Stats`, iconURL: client.user?.displayAvatarURL() || undefined })
			.setColor(color)
			.addFields(
				{ name: "Total Guilds", value: `${client.guilds.cache.size.toLocaleString()}` },
				{ name: "Cached Users", value: `${client.users.cache.size.toLocaleString()}` },
				{ name: "Ram Usage", value: `\`${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB\` / \`512 MB\`` }
			); (await reply).edit({ embeds: [embed], content: "" });

	},
}

export = command;