import { Client, ColorResolvable, Message, PermissionsBitField } from "discord.js";
import { Utilities } from "../../../utils/Utilities";

module.exports = {
	commands: ["warn", "warning", "infract"],
	minArgs: 1,
	expectedArgs: "[@User/User ID] (Reason)",
	userPermissions: [PermissionsBitField.Flags.ManageMessages],
	commandCategory: "Moderation",
	callback: async (client: Client, message: Message, args: string[]) => {

		const settings = await new Utilities().getGuildSettings(message.guild!); if (!settings) return;

		let color: ColorResolvable = await new Utilities().getEmbedColor(message.guild!)

		const user = message.mentions.members?.first() || await message.guild?.members.fetch(args[0]).catch(() => { });
		if (!user) return message.channel.send({ content: "Unable to fetch that member! Please try again." });

		let reason = "No reason provided.";
		if (args[1]) {
			reason = args.splice(1).join(" ");
		}

	}
}