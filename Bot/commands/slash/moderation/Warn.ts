import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, Client, ColorResolvable, GuildMember, PermissionsBitField, EmbedBuilder } from "discord.js";
import { Utilities } from "../../../utils/Utilities";
const ms = require("ms");
import { Log, LogLevel } from "../../../utils/Log";
import Cases from "../../../schemas/Cases";
import { EmbedUtils } from "../../../utils/EmbedUtils";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Issue a formal warning to a user.")
        .addUserOption(user =>
            user.setName("user")
                .setRequired(true)
                .setDescription("Select a user.")
        )
        .addStringOption(string =>
            string.setName("reason")
                .setRequired(false)
                .setDescription("Assign a reason for the warning.")
                .setMaxLength(250)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (!interaction.inCachedGuild()) return interaction.reply({ content: "You must be inside a cached guild to use this command!", ephemeral: true })

        const settings = await new Utilities().getGuildSettings(interaction.guild!); if (!settings) return;

        let color: ColorResolvable = await new Utilities().getEmbedColor(interaction.guild!);

        const reason = interaction.options.getString("reason") ?? "No reason provided.";

        let member = interaction.options.getMember("user"); if (!member) return interaction.reply({ content: "Invalid user provided!", ephemeral: true })

        if (member.roles.highest.position >= interaction.member.roles.highest.position) return interaction.reply({ content: "You are unable to warn users who are above you." })

        const warns = await new Utilities().warnCount(member.user);

        const caseNumberSet = await new Utilities().updateCaseCount(interaction.guild!);

        let remainder = 1;
        let warnsBeforeMute = settings.modSettings?.warnsBeforeMute ?? 3;

        if (warns != 0) {
            remainder = warns % warnsBeforeMute!;
        }
        if (settings.modSettings?.warnsBeforeMute == 0) {
            remainder = 1
        }
        if (!caseNumberSet) return interaction.reply({ content: "An error occurred, if this error persists please contact support." })

        if (remainder == 0 && interaction.guild?.members.me?.roles.highest.position! > member.roles.highest.position && interaction.guild?.members.me?.permissions.has([PermissionsBitField.Flags.ModerateMembers])) {

            const newCase = new Cases({
                guildID: interaction.guild.id,
                userID: member.id,
                modID: interaction.user.id,
                caseID: caseNumberSet,
                action: "AutoMute",
                caseDetails: {
                    reason: reason,
                    length: "10 Minutes",
                    date: Date.now(),
                }
            })
            newCase.save().catch((err: Error) => { Log(LogLevel.Error, "An error occurred in slash/moderation/Warn.ts\n\n" + err) })


            if (settings.modSettings?.dmOnPunish == true) {
                const dm = new EmbedBuilder()
                    .setAuthor({ name: "You have been muted in " + interaction.guild?.name + "!", iconURL: interaction.guild?.iconURL() || undefined })
                    .setColor(color)
                    .setDescription(`<:blurple_bulletpoint:997346294253244529> **Reason:** ${reason} Automatic mute due to excess warnings!
					<:blurple_bulletpoint:997346294253244529> **Duration:** 10 Minutes
					<:blurple_bulletpoint:997346294253244529> **Case:** #${caseNumberSet}`)
                    .setTimestamp()
                if (settings.guildSettings?.premium == false || !settings.guildSettings?.premium) {
                    member.send({ embeds: [dm], components: [new EmbedUtils().getInviteButton()] }).catch((err: Error) => {
                        Log(LogLevel.Error, "An error occurred in slash/moderation/Warn.ts\n\n" + err)
                    })
                } else if (settings.guildSettings?.premium == true) {
                    member.send({ embeds: [dm] }).catch((err: Error) => {
                        Log(LogLevel.Error, "An error occurred in slash/moderation/Warn.ts\n\n" + err)
                    })
                }
            }

            const autoMuted = new EmbedBuilder()
                .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.tag} | **Reason:** ${reason} | **Duration:** 10 Minutes`)
                .setColor(color)
            interaction.reply({ content: `<:arrow_right:967329549912248341> **${member.user.tag}** has been automatically muted! (Warns **${warns}**)`, embeds: [autoMuted] })

            new EmbedUtils().sendModLogs(
                {
                    guild: interaction.guild,
                    mod: interaction.member!,
                    target: member,
                },
                { title: "User Auto-Muted", actionInfo: `**Reason:** ${reason}\n> **Duration:** 10 Minutes\n> **Case ID:** ${caseNumberSet}` }
            );
            member.timeout(ms("10m"), reason)
            return;

        }

        const newCase = new Cases({
            guildID: interaction.guild.id,
            userID: member.id,
            modID: interaction.user.id,
            caseID: caseNumberSet,
            action: "Warn",
            caseDetails: {
                reason: reason,
                length: "Infinite",
                date: Date.now(),
            }
        })
        newCase.save().catch((err: Error) => { Log(LogLevel.Error, "An error occurred in slash/moderation/Warn.ts\n\n" + err) })


        if (settings.modSettings?.dmOnPunish == true) {
            const dm = new EmbedBuilder()
                .setAuthor({ name: "You have been warned in " + interaction.guild?.name + "!", iconURL: interaction.guild?.iconURL() || undefined })
                .setColor(color)
                .setDescription(`<:blurple_bulletpoint:997346294253244529> **Reason:** ${reason}
					<:blurple_bulletpoint:997346294253244529> **Case:** #${caseNumberSet}`)
                .setTimestamp()
            if (settings.guildSettings?.premium == false || !settings.guildSettings?.premium) {
                member.send({ embeds: [dm], components: [new EmbedUtils().getInviteButton()] }).catch((err: Error) => {
                    Log(LogLevel.Error, "An error occurred in slash/moderation/Warn.ts\n\n" + err)
                })
            } else if (settings.guildSettings?.premium == true) {
                member.send({ embeds: [dm] }).catch((err: Error) => {
                    Log(LogLevel.Error, "An error occurred in slash/moderation/Warn.ts\n\n" + err)
                })
            }
        }

        const warned = new EmbedBuilder()
            .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.tag} | **Reason:** ${reason}`)
            .setColor(color)
        interaction.reply({ content: `<:arrow_right:967329549912248341> **${member.user.tag}** has been warned! (Warns **${warns}**)`, embeds: [warned] })

        new EmbedUtils().sendModLogs(
            {
                guild: interaction.guild,
                mod: interaction.member!,
                target: member,
            },
            { title: "User Warned", actionInfo: `**Reason:** ${reason}\n> **Case ID:** ${caseNumberSet}` }
        );

    }
}