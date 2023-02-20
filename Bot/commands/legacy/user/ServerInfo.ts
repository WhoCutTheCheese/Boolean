import { Client, ColorResolvable, EmbedBuilder, GuildMember, GuildVerificationLevel, Message, TextChannel, User, Utils } from "discord.js";
import { BooleanCommand } from "../../../interface/BooleanCommand";
import Settings from "../../../schemas/Settings";
import { Utilities } from "../../../utils/Utilities";

const command: BooleanCommand = {
	command: 'serverinfo',
	aliases: ['si', 'sinfo', 'guildinfo'],
	description: "Get the current guild's info",
	maxArgs: 1,
	cooldown: 2,
	commandCategory: "User",
	callback: async (client: Client, message: Message, args: string[]) => {

		let color = await new Utilities().getEmbedColor(message.guild);

		const fetchedMembers = message.guild!.members.fetch();
		const totalMembers = (await fetchedMembers).size.toLocaleString();
		const totalHumans = (await fetchedMembers).filter((member: GuildMember) => !member.user.bot).size.toLocaleString();
		const totalBots = (await fetchedMembers).filter((member: GuildMember) => member.user.bot).size.toLocaleString();

		let verifLevel;
		if (message.guild?.verificationLevel == GuildVerificationLevel.None) { verifLevel = "None"; }
		if (message.guild?.verificationLevel == GuildVerificationLevel.Low) { verifLevel = "Low"; }
		if (message.guild?.verificationLevel == GuildVerificationLevel.Medium) { verifLevel = "Medium"; }
		if (message.guild?.verificationLevel == GuildVerificationLevel.High) { verifLevel = "(╯°□°）╯︵  ┻━┻"; }
		if (message.guild?.verificationLevel == GuildVerificationLevel.VeryHigh) { verifLevel = "┻━┻ミヽ(ಠ益ಠ)ノ彡┻━┻"; }

		const serverInfoEmbed = new EmbedBuilder()
			.setAuthor({ name: `${message.guild!.name} Information`, iconURL: message.guild!.iconURL() || undefined })
			.setThumbnail(message.guild!.iconURL() || null)
			.setColor(color)
			.addFields(
				{ name: "Name:", value: `${message.guild?.name}`, inline: true },
				{ name: "ID:", value: `${message.guild?.id}`, inline: true },
				{ name: "Owner:", value: `<@${message.guild?.ownerId}>`, inline: true },
				{ name: "Members:", value: `**${totalMembers}** total members,\n**${totalHumans}** total humans,\n**${totalBots}** total bots`, inline: false },
				{ name: "Emojis:", value: `${message.guild?.emojis.cache.size}`, inline: true },
				{ name: "Roles:", value: `${message.guild?.roles.cache.size.toLocaleString()}`, inline: true },
				{ name: "Channels:", value: `${message.guild?.channels.cache.size.toLocaleString()}`, inline: true },
				{ name: "Verification Level:", value: `${verifLevel}`, inline: true },
				{ name: "Creation Date:", value: `<t:${Math.floor((message.channel as TextChannel).guild.createdAt.getTime() / 1000)}:D> (<t:${Math.floor((message.channel as TextChannel).guild.createdAt.getTime() / 1000)}:R>)`, inline: true }
			)
			.setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined });
		message.reply({ embeds: [serverInfoEmbed] });

	},
}

export = command;