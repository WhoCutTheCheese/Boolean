import { ChatInputCommandInteraction, Client, ColorResolvable, EmbedBuilder, Message, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Utilities } from "../../../utils/Utilities";
import { weirdToNormalChars } from "weird-to-normal-chars";
import Cases from "../../../schemas/Cases";
import { EmbedUtils } from "../../../utils/EmbedUtils";
import { Log } from "../../../utils/Log";


module.exports = {
	data: new SlashCommandBuilder()
		.setName("sanitize")
		.setDescription("Sanitize a user's nickname from special characters and hoisting.")
		.addUserOption(opt =>
			opt
				.setName("user")
				.setDescription("User you'd like to sanitize.")
				.setRequired(true)
		)
		.addStringOption(opt =>
			opt
				.setName("reason")
				.setDescription("Enter reason for sanitization.")
				.setRequired(false)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	async execute(interaction: ChatInputCommandInteraction, client: Client) {
		if (!interaction.inCachedGuild()) return interaction.reply({ content: "You must be inside a cached guild to use this command!", ephemeral: true });

		let color: ColorResolvable = await new Utilities().getEmbedColor(interaction.guild!);

		let member = interaction.options.getMember("user");
		if (!member) return interaction.reply({ content: "Invalid user!", ephemeral: true });

		const reason = interaction.options.getString("reason") || "No reason provided.";

		if (interaction.guild?.ownerId === member.id || member.roles.highest.position >= interaction.guild.members.me!.roles.highest.position)
			return interaction.reply({
				content: "I am unable to edit their username!",
				ephemeral: true
			});

		const before = member.user.username;
		let after = member.user.username;

		after = weirdToNormalChars(after);
		if (after.startsWith("!")) {
			after = after.substring(1);
		}

		const caseNumberSet = await new Utilities().incrementCaseCount(interaction.guild!);

		member.setNickname(after).catch((err: Error) => {
			console.error(err);
			interaction.reply({ content: "An unknown error occurred! If this issue persists, please join our support server.", });
		});

		const sanitized = new EmbedBuilder().setDescription(`You have sanitized \`${member.user.tag}\`'s name.\n**New Nickname:** ${after}`).setColor(color);
		if (after.startsWith(" ")) after = after.substring(1);
		new EmbedUtils().sendModLogs(
			{
				guild: interaction.guild,
				mod: interaction.member!,
				target: member,
				action: "Username Sanitized",
			},
			{ title: "Username Sanitized", actionInfo: `\`${before}\` -> \`${after}\`` }
		);

		const newCase = new Cases({
			guildID: interaction.guild.id,
			userID: member.id,
			modID: interaction.user.id,
			caseID: caseNumberSet,
			action: "Username Sanitized",
			caseDetails: {
				reason: reason,
				length: "None",
				date: Date.now(),
			}
		});
		newCase.save().catch((err: Error) => { Log.error("An error occurred in slash/moderation/Sanitize.ts\n\n" + err); });
		
		interaction.reply({ embeds: [sanitized] });
	}
};