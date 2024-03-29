import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, TextChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, APIButtonComponent, Interaction, PermissionFlagsBits, ButtonInteraction } from "discord.js";
import Settings from "../../models/settings";
import Permits from "../../models/permits";
import Cases from "../../models/cases";
const _ = require("lodash");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("history")
        .setDescription("View the punishment history of any user.")
        .addUserOption(user =>
            user.setName("user")
                .setRequired(true)
                .setDescription("History user.")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {

        if (!interaction.inCachedGuild()) { return interaction.reply({ content: "You can only use this command in cached guilds!" }); }

        const settings = await Settings.findOne({
            guildID: interaction.guild?.id
        })
        if (!settings) return interaction.reply({ content: "Sorry, your settings file doesn't exist! If this error persists contact support", ephemeral: true })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

        const permits = await Permits.find({
            guildID: interaction.guild.id
        })

        let hasPermit: boolean = false
        const roles = interaction.member.roles.cache.map(role => role);
        let hasRole: boolean = false
        let ObjectID: any

        for (const role of roles) {
            for (const permit of permits) {
                if(permit.roles.includes(role.id)) {
                    hasRole = true
                    ObjectID = permit._id
                    break;
                } else {
                    hasRole = false
                }
            }
            if(hasRole == true) break;
        }

        for (const permit of permits) {
            if(permit.users.includes(interaction.user.id)) {
                ObjectID = permit._id;
                break;
            }
        }

        const thePermit = await Permits.findOne({
            _id: ObjectID
        })
        if(thePermit?.commandAccess.includes("HISTORY") || thePermit?.commandAccess.includes("MODERATION")) hasPermit = true;
        if(thePermit?.commandBlocked.includes("HISTORY") || thePermit?.commandBlocked.includes("MODERATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })

        let histUser = interaction.guild.members.cache.get(interaction.options.getUser("user")?.id!);
        if(!histUser) return interaction.reply({ content: "This user is not in the guild.", ephemeral: true })

        let arr : string[] = [];
        
        const cases = await Cases.find({
            userID: histUser.id,
            guildID: interaction.guild.id
        })

        for (const foundCases of cases) {
            arr.push(`\n\n**__Case #${foundCases.caseNumber}__**\n**Mod:** <@${foundCases.modID}>\n**Case Type:** ${foundCases.caseType}\n**Reason:** ${foundCases.caseReason}\n**Length:** ${foundCases.caseLength}\n**Date:** <t:${Math.round(foundCases.caseDate! as any / 1000)}:F>`)
        }

        const historyArray = _.chunk(arr, 5)

        if(historyArray.length == 0) return interaction.reply({ content: "This user does not have any past punishments!", ephemeral: true })

        let row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`left.${interaction.user.id}`)
                    .setStyle(ButtonStyle.Success)
                    .setEmoji("◀"),
                new ButtonBuilder()
                    .setCustomId(`end_interaction.${interaction.user.id}`)
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji("✖"),
                new ButtonBuilder()
                    .setCustomId(`right.${interaction.user.id}`)
                    .setStyle(ButtonStyle.Success)
                    .setEmoji("▶"),
            )
            let numbers = 0

            const historyEmbed = new EmbedBuilder()
                .setAuthor({ name: `${histUser.user.username}'s History`, iconURL: histUser.user.displayAvatarURL() || undefined })
                .setThumbnail(histUser.user.displayAvatarURL() || null)
                .setColor(color)
                .setDescription(`${historyArray[numbers]}`)
                .setFooter({ text: `Requsted by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() || undefined})
            const histReply = await interaction.reply({ embeds: [historyEmbed], components: [row as ActionRowBuilder<ButtonBuilder>], fetchReply: true })

            const filter = (i: any) => i.user.id === interaction.user.id;

            const collector = histReply.createMessageComponentCollector({ filter, time: 20000 });

            collector.on("collect", async (buttonInteraction: ButtonInteraction) => {
                await buttonInteraction.deferUpdate()
                switch (buttonInteraction.customId) {
                    case `left.${buttonInteraction.user.id}`:
                        if(numbers === 0) return;
                        numbers = numbers - 1
                        const historyEmbed = new EmbedBuilder()
                            .setAuthor({ name: `${histUser?.user.username}'s History`, iconURL: histUser?.user.displayAvatarURL() || undefined })
                            .setThumbnail(histUser?.user.displayAvatarURL() || null)
                            .setColor(color)
                            .setDescription(`${historyArray[numbers]}`)
                            .setFooter({ text: `Requsted by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() || undefined})
                        interaction.editReply({ embeds: [historyEmbed], components: [row] })
                        break;
                    case `end_interaction.${buttonInteraction.user.id}`:
                        row = new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                ButtonBuilder.from(histReply.components[0].components[0] as APIButtonComponent).setDisabled(true),
                                ButtonBuilder.from(histReply.components[0].components[1] as APIButtonComponent).setDisabled(true),
                                ButtonBuilder.from(histReply.components[0].components[2] as APIButtonComponent).setDisabled(true),
                            )
                            const endedInteractioin = new EmbedBuilder()
                                .setAuthor({ name: `${histUser?.user.username}'s History`, iconURL: histUser?.user.displayAvatarURL() || undefined })
                                .setThumbnail(histUser?.user.displayAvatarURL() || null)
                                .setColor(color)
                                .setDescription(`${historyArray[numbers]}`)
                                .setFooter({ text: `Requsted by ${interaction.user.username} - Interaction Ended`, iconURL: interaction.user.displayAvatarURL() || undefined})
                            interaction.editReply({ embeds: [endedInteractioin], components: [row] })
                        break;
                    case `right.${buttonInteraction.user.id}`:
                        numbers = numbers + 1
                        if(historyArray[numbers] == null) { numbers = numbers - 1; return; }
                        const historyEmbed2 = new EmbedBuilder()
                            .setAuthor({ name: `${histUser?.user.username}'s History`, iconURL: histUser?.user.displayAvatarURL() || undefined })
                            .setThumbnail(histUser?.user.displayAvatarURL() || null)
                            .setColor(color)
                            .setDescription(`${historyArray[numbers]}`)
                            .setFooter({ text: `Requsted by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() || undefined})
                        interaction.editReply({ embeds: [historyEmbed2], components: [row] })
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
                    .setAuthor({ name: `${histUser?.user.username}'s History`, iconURL: histUser?.user.displayAvatarURL() || undefined })
                    .setThumbnail(histUser?.user.displayAvatarURL() || null)
                    .setColor(color)
                    .setDescription(`${historyArray[numbers]}`)
                    .setFooter({ text: `Requsted by ${interaction.user.username} - Interaction Ended`, iconURL: interaction.user.displayAvatarURL() || undefined})
                interaction.editReply({ embeds: [historyEmbed2], components: [row] })
            })

    }
}