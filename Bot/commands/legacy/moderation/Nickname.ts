import {
	Client,
	ColorResolvable,
	EmbedBuilder,
	Message,
	PermissionsBitField,
} from "discord.js";
import { Utilities } from "../../../utils/Utilities";
import { EmbedUtils } from "../../../utils/EmbedUtils";

module.exports = {
	commands: ["nick", "nickname"],
	minArgs: 1,
	expectedArgs: "[@User/User ID] [Reset/New Nickname]",
	botPermissions: [PermissionsBitField.Flags.ChangeNickname],
	userPermissions: [PermissionsBitField.Flags.ChangeNickname],
	commandCategory: "Moderation",
	callback: async (client: Client, message: Message, args: string[]) => {
		if (!message.guild?.members?.me) {
			message.channel.send({ content: "This command can only be used in a guild", });
			return;
		}

		const settings = await new Utilities().getGuildSettings(message.guild!);
		if (!settings) return;

		let color: ColorResolvable = await new Utilities().getEmbedColor(message.guild!);

		const user =
			message.mentions.members?.first() ||
			(await message.guild?.members.fetch(args[0]).catch(() => { }));
		if (!user)
			return message.channel.send({ content: "Unable to fetch that member! Please try again.", });

		if (
			message.guild?.ownerId === user.id || user.roles.highest.position > message.guild.members.me.roles.highest.position)
			return message.channel.send({
				content: "I am unable to edit their username!",
			});

		let newNick: string | null = null;
		let response = `You have reset **${user.user.tag}**'s nickname!`;
		let action = "Nickname Reset";

		if (args[1]) {
			newNick = args.splice(1).join(" ");
			response = `You have set **${user.user.tag}**'s nickname to \`${newNick}\`!`;
			action = "Nickname Set";
			if (newNick?.length > 30) { return message.channel.send({ content: "Nickname length must be less than 30 characters." }) }
		}

		let oldNick = user.user.username;
		if (user.nickname) {
			oldNick = user.nickname;
		}

		user.setNickname(newNick).catch((err: Error) => {
			console.error(err);
			message.channel.send({ content: "An unknwon error occurred! If this issue persists, please join our support server.", });
		});

		const nickSet = new EmbedBuilder().setDescription(response).setColor(color);
		message.channel.send({ embeds: [nickSet] });

		new EmbedUtils().sendModLogs(
			{
				guild: message.guild,
				mod: message.member!,
				target: user,
				action: action,
			},
			{ title: "Nickname Edited", actionInfo: `\`${oldNick}\` -> \`${newNick}\`` }
		);
	},
};
