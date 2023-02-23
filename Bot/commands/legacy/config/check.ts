import { Client, ColorResolvable, EmbedBuilder, Message, PermissionsBitField } from "discord.js";
import { Utilities } from '../../../utils/Utilities';
import * as config from '../../../config.json'
import { BooleanCommand } from '../../../interface/BooleanCommand';

const command: BooleanCommand = {
	command: "check",
	description: "a list of everything Boolean needs to run smoothly",
	userPermissions: [PermissionsBitField.Flags.ManageGuild],
	cooldown: 5,
	commandCategory: "Configuration",
	callback: async (client: Client, message: Message, args: string[]) => {

		let settings = await new Utilities().getGuildSettings(message.guild)
		if (!settings) return;
		let color: ColorResolvable = await new Utilities().getEmbedColor(message.guild)

		let yes = config.yesEmoji;
		let no = config.noEmoji;
		let recommended = config.recommendedEmoji

		let manageRoles = message.guild?.members.me?.permissions.has(PermissionsBitField.Flags.ManageRoles) ? yes : no;
		let kickMembers = message.guild?.members.me?.permissions.has(PermissionsBitField.Flags.KickMembers) ? yes : no;
		let banMembers = message.guild?.members.me?.permissions.has(PermissionsBitField.Flags.BanMembers) ? yes : no;
		let moderateMembers = message.guild?.members.me?.permissions.has(PermissionsBitField.Flags.ModerateMembers) ? yes : no;
		let manageNicknames = message.guild?.members.me?.permissions.has(PermissionsBitField.Flags.ManageNicknames) ? yes : no;
		let manageMessages = message.guild?.members.me?.permissions.has(PermissionsBitField.Flags.ManageMessages) ? yes : no;
		let admin = message.guild?.members.me?.permissions.has(PermissionsBitField.Flags.Administrator) ? yes : recommended;

		let muteRoleSet = settings.modSettings?.muteRole ? yes : no;
		let modLogChannelSet = settings.modSettings?.modLogChannel ? yes : recommended;
		let joinRolesSet = settings.guildSettings?.joinRoles ? yes : recommended;
		let manageChannels = message.guild?.members.me?.permissions.has(PermissionsBitField.Flags.ManageChannels) ? yes : no;


		const checkEmbed = new EmbedBuilder()
			.setAuthor({ name: "Setup Check", iconURL: message.author.displayAvatarURL() || undefined })
			.setDescription(`This is a comprehensive list of everything Boolean needs to run smoothly.\n**No Action Needed:** ${yes}\n**Action Needed:** ${no}\n**Recommended Setting:** ${recommended}\n\n**Bot Permissions:** Permissions Boolean needs to run\n> [Manage Roles: ${manageRoles}]\n> [Manage Nicknames: ${manageNicknames}]\n> [Manage Messages: ${manageMessages}]\n> [Manage Channels: ${manageChannels}]\n> [Timeout Users: ${moderateMembers}]\n> [Ban Members: ${banMembers}]\n> [Kick Members: ${kickMembers}]\n> [Administrator: ${admin}]\n\n**Configuration Settings:** Configuration settings\n> [Mute Role: ${muteRoleSet}]\n> [Mod Logs Channel: ${modLogChannelSet}]\n> [Join Role(s): ${joinRolesSet}]`)
			.setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
			.setColor(color)
		message.channel.send({ embeds: [checkEmbed] })

	}
}

export = command