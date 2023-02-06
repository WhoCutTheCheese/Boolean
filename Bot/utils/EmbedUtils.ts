import { Collection, Guild, PermissionsBitField, REST, Routes, ColorResolvable, Embed, EmbedBuilder, MessageType, Message, Channel, TextChannel, GuildMember, User, Attachment, AttachmentBuilder } from 'discord.js';
import { Utilities } from './Utilities';
import { Document } from 'mongoose';

export enum messageType {
	String,
	Embed
}

export class EmbedUtils {
	async sendSuccessEmbed(channel: TextChannel, orgMessage: Message | null, settings: { successEmoji: boolean, replyToMessage: boolean, deleteMsg?: boolean, deleteTimerTime?: number }, args: { title?: string, description: string, footer?: string }) {
		let embed = await new EmbedBuilder()
			.setTitle(args.title || "Success")
			.setDescription(`${(settings.successEmoji ? "<:yes:979193272612298814>" : "")} ${args.description}`)
			.setFooter({ text: args.footer || " " })
			.setColor(await new Utilities().getEmbedColor(channel.guild))

		let newMSG: Message;
		if (settings.replyToMessage && orgMessage) {
			newMSG = await orgMessage.reply({ embeds: [embed] });
		} else newMSG = await channel.send({ embeds: [embed] })

		if (settings.deleteMsg) {
			setTimeout(() => {
				try {
					newMSG.delete()
				} catch (err) { }

			}, settings.deleteTimerTime || 5000);
		}
	}

	async sendErrorEmbed(channel: TextChannel, orgMessage: Message | null, settings: { errorEmoji: boolean, replyToMessage: boolean, deleteMsg?: boolean, deleteTimerTime?: number }, args: { title?: string, description: string, footer?: string }) {
		let embed = await new EmbedBuilder()
			.setTitle(args.title || "Error")
			.setDescription(`${(settings.errorEmoji ? "<:no:979193272784265217> " : "")} ${args.description}`)
			.setFooter({ text: args.footer || " " })
			.setColor(await new Utilities().getEmbedColor(channel.guild))

		let newMSG: Message;
		if (settings.replyToMessage && orgMessage) {
			newMSG = await orgMessage.reply({ embeds: [embed] });
		} else newMSG = await channel.send({ embeds: [embed] })

		if (settings.deleteMsg) {
			setTimeout(() => {
				try {
					newMSG.delete()
				} catch (err) { }
			}, settings.deleteTimerTime || 5000);
		}
	}

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