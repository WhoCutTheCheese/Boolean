import { Client, Collection, ColorResolvable, Message, PermissionsBitField, TextChannel } from 'discord.js';
import Settings from "../../schemas/Settings";
let prefix: string | undefined
import Maintenance from "../../schemas/Maintenance";
import { Utilities } from '../../utils/Utilities';
import { EmbedType, EmbedUtils } from '../../utils/EmbedUtils';
import { Main } from '../../index';
import { BooleanCommand } from '../../interface/BooleanCommand';
import { Log, LogLevel } from '../../utils/Log';

declare module "discord.js" {
	export interface Client {
		legacycommands: Collection<string, BooleanCommand>
		legacycommandalias: Collection<string, string>,
		slashcommands: Collection<unknown, any>
		slashcommandsArray: [],
	}
}

const client: Client<boolean> = new Main().getClient();
const devs = new Utilities().getConfig().devs

const cooldowns: Map<string, Map<string, number>> = new Map();
client.on("messageCreate", async (message: Message) => {
	try {
		if (!message.inGuild) return;
		if (!message.guild?.members.me?.permissions.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) return;
		if (!(message.channel as TextChannel).permissionsFor(message.guild?.members.me!)?.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) return;

		const settings = await Settings.findOne({
			guildID: message.guild?.id
		})
		if (!settings) {
			await new Utilities().createFile({ guild: message.guild! });
			return;
		}

		let color: ColorResolvable = "5865F2" as ColorResolvable;
		if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

		prefix = settings.guildSettings?.prefix || "!!";

		const args = message.content.split(/[ ]+/)
		const name = args.shift()!.toLowerCase();

		if (name.trim().toLowerCase() === `<@${client.user!.id}>`) return new EmbedUtils().sendEmbed(EmbedType.error, message.channel, { message: message, replyToMessage: true }, { title: "Prefix", description: `The current guild prefix is \`${prefix}\`` })

		if (!name.startsWith(prefix)) return;
		const maintenance = await Maintenance.findOne({
			botID: client.user?.id
		})

		if (maintenance) {
			if (maintenance.maintenance == true) {
				if (!devs.includes(message.author.id)) {
					new EmbedUtils().sendEmbed(EmbedType.error, message.channel as TextChannel, { message: message, replyToMessage: true }, { title: "Uh oh!", description: `Boolean is currently under maintenance!\n**__Details:__** ${maintenance.maintainDetails}` })
					return;
				}
			}
		}

		const commandName = name.replace(prefix, '');
		let command: BooleanCommand = client.legacycommands.get(commandName)! || client.legacycommands.get(client.legacycommandalias.get(commandName)!)!
		if (!command) return;

		let {
			minArgs = 0,
			maxArgs = null,
			expectedArgs = "",
			cooldown = 0,
			devOnly = false,
			botPermissions = [],
			userPermissions = [],
			premium = false,
			guildonly = true,
			callback,
		} = command

		if (devOnly == true) {
			if (!devs.includes(message.author.id)) {
				return new EmbedUtils().sendEmbed(EmbedType.error, message.channel, { message: message, replyToMessage: true }, { title: "No permissions", description: `This command is for developers only.` })
			}
		}

		if ((botPermissions as Array<PermissionsBitField>).length > 0) {

			let missingPerm: Boolean = false

			for (let perm of botPermissions) {

				if (!message.guild?.members?.me?.permissions.has(perm, true)) {
					missingPerm = true
				}

				if (!(message.channel as TextChannel).permissionsFor(message.guild?.members.me!)?.has(perm, true)) {
					missingPerm = true
				};
			}

			if (missingPerm) {
				message.channel.send({ content: `I am missing the permissions to run this command :(` })
				return;
			}
		}

		if ((userPermissions as Array<PermissionsBitField>).length > 0) {

			let missingPerm: Boolean = false

			for (let perm of botPermissions) {

				if (!message.member?.permissions.has(perm, true)) {
					missingPerm = true
				}

				if (!(message.channel as TextChannel).permissionsFor(message.member!)?.has(perm, true)) {
					missingPerm = true
				};
			}

			if (missingPerm) {
				new EmbedUtils().sendEmbed(EmbedType.error, message.channel, { message: message, replyToMessage: true, deleteMsg: true }, { title: "No permissions", description: `You do not have the correct permissions required to run this command.` })
				return;
			}

		}

		if (args.length < minArgs || (maxArgs !== null && args.length > maxArgs)) {
			new EmbedUtils().sendEmbed(EmbedType.error, message.channel, { deleteMsg: true }, { title: "Invalid syntax", description: `Please use \`${name} ${expectedArgs}\`` })
			return;
		}

		if (cooldown > 0) {
			let userId = message.author.id

			if (!cooldowns.has(commandName)) {
				cooldowns.set(commandName, new Map());
			}

			const now = Math.floor(Date.now() / 1000);
			const timestamps = cooldowns.get(commandName);
			if (timestamps!.get(userId)) {
				let remainingTime = timestamps!.get(userId)! + cooldown - now;

				if (remainingTime > 0) {
					new EmbedUtils().sendEmbed(EmbedType.error, message.channel, { deleteMsg: true, deleteTimerTime: 3000 }, { title: "Cooldown", description: `You must wait \`${remainingTime} second(s)\` before using this command again!` })
					return;
				} else {
					timestamps?.delete(userId)
				}
			} else {
				timestamps!.set(userId, now);
			}
		}

		if (message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
			if ((message.channel as TextChannel).permissionsFor(message.guild.members.me!)?.has(PermissionsBitField.Flags.ManageMessages)) {
				if (settings.modSettings?.deleteCommandUsage == true) {
					if (message.deletable) {
						try {
							message.delete()
						} catch (err) { }
					}
				}
			}
		}

		callback(client, message, args, args.join(' '))

	} catch (err) {
		if (message.guild?.members.me?.permissions.has(PermissionsBitField.Flags.SendMessages)) {
			Log.error((err as any))
			return;
		}
	}
})