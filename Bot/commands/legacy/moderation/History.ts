import { ActionRowBuilder, APIButtonComponent, ButtonBuilder, ButtonInteraction, ButtonStyle, Client, ColorResolvable, EmbedBuilder, Message, PermissionsBitField, User } from "discord.js";
import Cases from "../../../schemas/Cases";
import { Utilities } from "../../../utils/Utilities";
const _ = require("lodash");

module.exports = {
    commands: ['history', 'infractions', 'warns', 'h', 'hist'],
    maxArgs: 1,
    minArgs: 1,
    cooldown: 3,
	userPermissions: [PermissionsBitField.Flags.ManageMessages],
    expectedArgs: "[@User/User ID]",
    commandCategory: "Moderation",
    callback: async (client: Client, message: Message, args: string[]) => {

		const settings = await new Utilities().getGuildSettings(message.guild!);
		if (!settings) return;

		let color: ColorResolvable = await new Utilities().getEmbedColor(message.guild!);

        const user = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
        if (!user) return message.channel.send({ content: "Invalid User!" });

        let arr: string[] = [];

        const cases = await Cases.find({
            userID: user.id,
            guildID: message.guild?.id
        })

        for (const foundCases of cases) {
            arr.push(`\n\n**__Case #${foundCases.caseID}__**\n**Mod:** <@${foundCases.modID}>\n**Case Type:** ${foundCases.action}\n**Reason:** ${foundCases.caseDetails?.reason}\n**Length:** ${foundCases.caseDetails?.length}\n**Date:** <t:${Math.round(foundCases.caseDetails?.date! as any / 1000)}:F>`)
        }

        const historyArray = _.chunk(arr, 5)

        if (historyArray.length == 0) return message.channel.send({ content: "This user does not have any past punishments!" })

        let row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`left.${message.author.id}`)
                    .setStyle(ButtonStyle.Success)
                    .setEmoji("◀"),
                new ButtonBuilder()
                    .setCustomId(`end_interaction.${message.author.id}`)
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji("✖"),
                new ButtonBuilder()
                    .setCustomId(`right.${message.author.id}`)
                    .setStyle(ButtonStyle.Success)
                    .setEmoji("▶"),
            )
        let numbers = 0

        const historyEmbed = new EmbedBuilder()
            .setAuthor({ name: `${user.user.username}'s History`, iconURL: user.user.displayAvatarURL() || undefined })
            .setThumbnail(user.user.displayAvatarURL() || null)
            .setColor(color)
            .setDescription(`${historyArray[numbers]}`)
            .setFooter({ text: `Requsted by ${message.author.username}`, iconURL: message.author.displayAvatarURL() || undefined })
        const histReply = await message.channel.send({ embeds: [historyEmbed], components: [row as ActionRowBuilder<ButtonBuilder>] })

        const filter = (i: any) => i.user.id === message.author.id;

        const collector = histReply.createMessageComponentCollector({ filter, time: 20000 });

        collector.on("collect", async (buttonInteraction: ButtonInteraction) => {
            await buttonInteraction.deferUpdate()
            switch (buttonInteraction.customId) {
                case `left.${buttonInteraction.user.id}`:
                    if (numbers === 0) return;
                    numbers = numbers - 1
                    const historyEmbed = new EmbedBuilder()
                        .setAuthor({ name: `${user?.user.username}'s History`, iconURL: user?.user.displayAvatarURL() || undefined })
                        .setThumbnail(user?.user.displayAvatarURL() || null)
                        .setColor(color)
                        .setDescription(`${historyArray[numbers]}`)
                        .setFooter({ text: `Requsted by ${message.author.username}`, iconURL: message.author.displayAvatarURL() || undefined })
                    histReply.edit({ embeds: [historyEmbed], components: [row] })
                    break;
                case `end_interaction.${buttonInteraction.user.id}`:
                    row = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            ButtonBuilder.from(histReply.components[0].components[0] as APIButtonComponent).setDisabled(true),
                            ButtonBuilder.from(histReply.components[0].components[1] as APIButtonComponent).setDisabled(true),
                            ButtonBuilder.from(histReply.components[0].components[2] as APIButtonComponent).setDisabled(true),
                        )
                    const endedInteractioin = new EmbedBuilder()
                        .setAuthor({ name: `${user?.user.username}'s History`, iconURL: user?.user.displayAvatarURL() || undefined })
                        .setThumbnail(user?.user.displayAvatarURL() || null)
                        .setColor(color)
                        .setDescription(`${historyArray[numbers]}`)
                        .setFooter({ text: `Requsted by ${message.author.username} - Interaction Ended`, iconURL: message.author.displayAvatarURL() || undefined })
                    histReply.edit({ embeds: [endedInteractioin], components: [row] })
                    break;
                case `right.${buttonInteraction.user.id}`:
                    numbers = numbers + 1
                    if (historyArray[numbers] == null) { numbers = numbers - 1; return; }
                    const historyEmbed2 = new EmbedBuilder()
                        .setAuthor({ name: `${user?.user.username}'s History`, iconURL: user?.user.displayAvatarURL() || undefined })
                        .setThumbnail(user?.user.displayAvatarURL() || null)
                        .setColor(color)
                        .setDescription(`${historyArray[numbers]}`)
                        .setFooter({ text: `Requsted by ${message.author.username}`, iconURL: message.author.displayAvatarURL() || undefined })
                    histReply.edit({ embeds: [historyEmbed2], components: [row] })
                    break;
                default:
                    buttonInteraction.reply({ content: "This is not your embed!", ephemeral: true })
            }
        })

        collector.on("end", buttonInteraction => {
            row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    ButtonBuilder.from(histReply.components[0].components[0] as APIButtonComponent).setDisabled(true),
                    ButtonBuilder.from(histReply.components[0].components[1] as APIButtonComponent).setDisabled(true),
                    ButtonBuilder.from(histReply.components[0].components[2] as APIButtonComponent).setDisabled(true),
                )
            const historyEmbed2 = new EmbedBuilder()
                .setAuthor({ name: `${user?.user.username}'s History`, iconURL: user?.user.displayAvatarURL() || undefined })
                .setThumbnail(user?.user.displayAvatarURL() || null)
                .setColor(color)
                .setDescription(`${historyArray[numbers]}`)
                .setFooter({ text: `Requsted by ${message.author.username} - Interaction Ended`, iconURL: message.author.displayAvatarURL() || undefined })
            histReply.edit({ embeds: [historyEmbed2], components: [row] })
        })


    },
}