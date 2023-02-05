import { ChatInputCommandInteraction, Client, ColorResolvable, EmbedBuilder, GuildMember, GuildVerificationLevel, Message, SlashCommandBuilder, TextChannel } from "discord.js";
import Settings from "../../../schemas/Settings";
import { Utilities } from "../../../utils/Utilities";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("serverinfo")
		.setDescription("Get an extensive information on the current guild.")
		.setDMPermission(false),
	async execute(interaction: ChatInputCommandInteraction, client: Client) {
		if (!interaction.inCachedGuild()) return interaction.reply({ content: "You must be inside a cached guild to use this command!", ephemeral: true })

		const settings = await Settings.findOne({
			guildID: interaction.guild?.id
		})
		if (!settings) {
			await new Utilities().createFile({ guild: interaction.guild! });
			interaction.reply({ content: "Sorry, your settings file doesn't exist! If this error persists contact support", ephemeral: true });
			return;
		}
		let color: ColorResolvable = "5865F2" as ColorResolvable;
		if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

		const fetchedMembers = interaction.guild.members.fetch();
		const totalMembers = (await fetchedMembers).size.toLocaleString();
		const totalHumans = (await fetchedMembers).filter((member: GuildMember) => !member.user.bot).size.toLocaleString();
		const totalBots = (await fetchedMembers).filter((member: GuildMember) => member.user.bot).size.toLocaleString();

		let verifLevel
		if (interaction.guild?.verificationLevel == GuildVerificationLevel.None) { verifLevel = "None" }
		if (interaction.guild?.verificationLevel == GuildVerificationLevel.Low) { verifLevel = "Low" }
		if (interaction.guild?.verificationLevel == GuildVerificationLevel.Medium) { verifLevel = "Medium" }
		if (interaction.guild?.verificationLevel == GuildVerificationLevel.High) { verifLevel = "(╯°□°）╯︵  ┻━┻" }
		if (interaction.guild?.verificationLevel == GuildVerificationLevel.VeryHigh) { verifLevel = "┻━┻ミヽ(ಠ益ಠ)ノ彡┻━┻" }

		const serverInfoEmbed = new EmbedBuilder()
			.setAuthor({ name: `${interaction.guild.name} Information`, iconURL: interaction.guild.iconURL() || undefined })
			.setThumbnail(interaction.guild.iconURL() || null)
			.setColor(color)
			.addFields(
				{ name: "Name:", value: `${interaction.guild?.name}`, inline: true },
				{ name: "ID:", value: `${interaction.guild?.id}`, inline: true },
				{ name: "Owner:", value: `<@${interaction.guild?.ownerId}>`, inline: true },
				{ name: "Members:", value: `**${totalMembers}** total members,\n**${totalHumans}** total humans,\n**${totalBots}** total bots`, inline: false },
				{ name: "Emojis:", value: `${interaction.guild?.emojis.cache.size}`, inline: true },
				{ name: "Roles:", value: `${interaction.guild?.roles.cache.size.toLocaleString()}`, inline: true },
				{ name: "Channels:", value: `${interaction.guild?.channels.cache.size.toLocaleString()}`, inline: true },
				{ name: "Verification Level:", value: `${verifLevel}`, inline: true },
				{ name: "Creation Date:", value: `<t:${Math.floor((interaction.channel as TextChannel).guild.createdAt.getTime() / 1000)}:D> (<t:${Math.floor((interaction.channel as TextChannel).guild.createdAt.getTime() / 1000)}:R>)`, inline: true },
			)
			.setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() || undefined })
		interaction.reply({ embeds: [serverInfoEmbed] })

	}
}