import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, Client, ColorResolvable, GuildMember, PermissionsBitField } from "discord.js";
import { Utilities } from "../../../utils/Utilities";
import { Log } from "../../../utils/Log";
import Cases from "../../../schemas/Cases";

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

        const caseNumberSet = new Utilities().updateCaseCount(interaction.guild);

        let remainder = 1;
        let warnsBeforeMute = settings.modSettings?.warnsBeforeMute ?? 3;

        if (remainder == 0 && interaction.guild?.members.me?.roles.highest.position! < member.roles.highest.position && interaction.guild?.members.me?.permissions.has([PermissionsBitField.Flags.ModerateMembers])) {

            const endDate = new Date();

            endDate.setSeconds(endDate.getSeconds() + 10 * 60)

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
            newCase.save().catch((err: Error) => { console.error(err) })

        }

    }
}