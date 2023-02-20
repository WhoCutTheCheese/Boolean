import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, Message } from "discord.js";
import { BooleanCommand } from "../../../interface/BooleanCommand";

const command: BooleanCommand = {
	commands: ['invite', 'add', 'support'],
	description: "The invite link, support server, and voting links!",
	commandCategory: "User",
	callback: async (client: Client, message: Message, args: string[]) => {

		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setLabel("Invite")
					.setEmoji("🔗")
					.setStyle(ButtonStyle.Link)
					.setURL("https://discord.com/api/oauth2/authorize?client_id=966634522106036265&permissions=1392307989702&scope=bot%20applications.commands"),
				new ButtonBuilder()
					.setLabel("Support Server")
					.setEmoji("🔗")
					.setStyle(ButtonStyle.Link)
					.setURL("https://discord.gg/VD4sf98hKd"),
				new ButtonBuilder()
					.setLabel("Vote Top.gg")
					.setEmoji("🔗")
					.setStyle(ButtonStyle.Link)
					.setURL("https://top.gg/bot/966634522106036265"),
				new ButtonBuilder()
					.setLabel("DBL.com")
					.setEmoji("🔗")
					.setStyle(ButtonStyle.Link)
					.setURL("https://discordbotlist.com/bots/boolean")
			);

		const invite = new EmbedBuilder()
			.setAuthor({ name: "Invite Boolean!", iconURL: client.user?.displayAvatarURL() || undefined })
			.setColor("Blurple")
			.setDescription(`Boolean is a in-depth moderation bot that can keep your server safe and give your moderators everything they need.
            Help support Boolean by voting with the links below.`)
			.setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined });
		message.channel.send({ embeds: [invite], components: [row] });

	},
}

export = command;