import { Collection, Guild, PermissionsBitField, REST, Routes, ColorResolvable, Embed, EmbedBuilder, Message, Channel, TextChannel, GuildMember, User, Attachment, AttachmentBuilder, PermissionResolvable, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedFooterOptions } from 'discord.js';
import { Utilities } from './Utilities';
import * as config from '../config.json'

export enum EmbedType {
	error,
	success
}

export class EmbedUtils {

	async sendEmbed(embedType: EmbedType, channel: Channel, settings: { message?: Message, emoji?: boolean, replyToMessage?: boolean, deleteMsg?: boolean, deleteTimerTime?: number }, args: { title?: string, description: string, footer?: EmbedFooterOptions }) {
		channel = channel as TextChannel
		let embed = await new EmbedBuilder()
			.setTitle(args.title || (embedType == EmbedType.success ? "Success" : "Error"))
			.setDescription(`${(settings.emoji ? (embedType == EmbedType.success ? config.yesEmoji : config.noEmoji) : "")} ${args.description}`)
			.setFooter(args.footer || { text: " " })
			.setColor(await new Utilities().getEmbedColor(channel.guild))


		let newMSG: Message;
		if (settings.replyToMessage && settings.message) {
			newMSG = await settings.message.reply({ embeds: [embed] });
		} else newMSG = await channel.send({ embeds: [embed] })

		if (settings.deleteMsg) {
			setTimeout(() => {
				try {
					newMSG.delete()
				} catch (err) { }

			}, settings.deleteTimerTime || 5000);
		}
	}

	async sendModerationSuccessEmbed(channel: TextChannel, orgMessage: Message | null, settings: { arrowEmoji?: boolean, replyToMessage?: boolean, deleteMsg?: boolean, deleteTimerTime?: number }, args: { mod: GuildMember, caseNumberSet: number, duration?: string, reason: string, customContent: string }) {
		let embed = new EmbedBuilder()
			.setDescription(`**Case:** #${args.caseNumberSet} | **Mod:** ${args.mod.user.tag} | **Reason:** ${args.reason} ${args.duration ? `| **Duration:** ${args.duration}` : ""}`)
			.setColor(await new Utilities().getEmbedColor(channel.guild))

		let newMSG: Message;
		if (settings.replyToMessage && orgMessage) {
			newMSG = await orgMessage.reply({ content: `${(settings.arrowEmoji ? config.arrowEmoji : "")} ${args.customContent}`, embeds: [embed] });
		} else newMSG = await channel.send({ content: `${(settings.arrowEmoji ? config.arrowEmoji : "")} ${args.customContent}`, embeds: [embed] })

		if (settings.deleteMsg) {
			setTimeout(() => {
				try {
					newMSG.delete()
				} catch (err) { }

			}, settings.deleteTimerTime || 5000);
		}
	}

	// async sendSuccessEmbed(channel: TextChannel, orgMessage: Message | null, settings: { successEmoji?: boolean, replyToMessage?: boolean, deleteMsg?: boolean, deleteTimerTime?: number }, args: { title?: string, description: string, footer?: string }) {
	// 	let embed = await new EmbedBuilder()
	// 		.setTitle(args.title || "Success")
	// 		.setDescription(`${(settings.successEmoji ? "<:yes:979193272612298814>" : "")} ${args.description}`)
	// 		.setFooter({ text: args.footer || " " })
	// 		.setColor(await new Utilities().getEmbedColor(channel.guild))

	// 	let newMSG: Message;
	// 	if (settings.replyToMessage && orgMessage) {
	// 		newMSG = await orgMessage.reply({ embeds: [embed] });
	// 	} else newMSG = await channel.send({ embeds: [embed] })

	// 	if (settings.deleteMsg) {
	// 		setTimeout(() => {
	// 			try {
	// 				newMSG.delete()
	// 			} catch (err) { }

	// 		}, settings.deleteTimerTime || 5000);
	// 	}
	// }

	// async sendErrorEmbed(channel: TextChannel, orgMessage: Message | null, settings: { emoji?: boolean, replyToMessage?: boolean, deleteMsg?: boolean, deleteTimerTime?: number }, args: { title?: string, description: string, footer?: string }) {
	// 	let embed = await new EmbedBuilder()
	// 		.setTitle(args.title || "Error")
	// 		.setDescription(`${(settings.emoji ? "<:no:979193272784265217> " : "")} ${args.description}`)
	// 		.setFooter({ text: args.footer || " " })
	// 		.setColor(await new Utilities().getEmbedColor(channel.guild))

	// 	let newMSG: Message;
	// 	if (settings.replyToMessage && orgMessage) {
	// 		newMSG = await orgMessage.reply({ embeds: [embed] });
	// 	} else newMSG = await channel.send({ embeds: [embed] })

	// 	if (settings.deleteMsg) {
	// 		setTimeout(() => {
	// 			try {
	// 				newMSG.delete()
	// 			} catch (err) { }
	// 		}, settings.deleteTimerTime || 5000);
	// 	}
	// }

	async sendArgsErrorEmbed(message: Message, argPlacement: number, cmdExports: typeof module.exports, args?: { description: string }) {
		let description: string = `${args && args.description ? args.description : `Invalid argument found at position \`${argPlacement}\``}\n\nCMD Args: \`${cmdExports.expectedArgs}\``; if (cmdExports.subCommands) description = description.concat(`\nSub commands: \`${cmdExports.subCommands.join(", ")}\``)
		message.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle("Argument Error")
					.setDescription(description)
					.setColor(await new Utilities().getEmbedColor(message.guild) || "#FF0000" as ColorResolvable)
			]
		})
	} // Look pretty arg errors

	getInviteButton(): ActionRowBuilder<ButtonBuilder> {
		return new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setLabel("Invite Me!")
					.setStyle(ButtonStyle.Link)
					.setURL("https://discord.com/oauth2/authorize?client_id=966634522106036265&permissions=1377007168710&scope=bot%20applications.commands")
			)
	}

	async sendModLogs(options: {
		guild: Guild,
		mod: GuildMember,
		target?: GuildMember,
		targetUser?: User,
		action?: string,
		attachments?: Array<AttachmentBuilder>;
	}, embedDetails: {
		title: string,
		actionInfo: string,
		channel?: Channel,
	}) {
		const { guild } = options;
		const settings = await new Utilities().getGuildSettings(guild)
		if (!settings) return

		let user: User = options.target?.user!;
		if (!user) {
			user = options.targetUser!;
		}

		let mod: GuildMember = options.mod;
		if (options.targetUser) {
			user = options.targetUser;
		}
		let users = `<:folder:977391492790362173> **Mod:** ${mod.user.tag} (${mod.id})`
		if (user) {
			users = users + `\n<:user:977391493218181120> **User:** ${(user as User).tag} (${user.id})`
		}
		let action = `> ${embedDetails.actionInfo}`
		let theChannel = ``
		if (embedDetails.channel) {
			theChannel = `\n<:channel:1071217768046800966> **Channel:** <#${embedDetails.channel.id}>`
		}

		const modLogEmbed = new EmbedBuilder()
			.setAuthor({ name: embedDetails.title, iconURL: mod.displayAvatarURL() || undefined })
			.setDescription(`${users} ${theChannel}
            <:clock:1071213725610151987> **Date:** <t:${Math.round(Date.now() / 1000)}:D>
            ${action}`)
			.setColor(await new Utilities().getEmbedColor(options.guild))
		const channel = guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel!);
		if (channel) {
			if (guild.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
				if (options.attachments) {
					await (guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed], files: options.attachments });
				} else {
					await (guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] });
				}
			}
		}

	}

}