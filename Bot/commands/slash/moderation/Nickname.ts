import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, Client, EmbedBuilder, ColorResolvable } from "discord.js";
import { Utilities } from "../../../utils/Utilities";
import { EmbedUtils } from "../../../utils/EmbedUtils";


module.exports = {
    data: new SlashCommandBuilder()
        .setName("nickname")
        .setDescription("Set the nickname of any user in your guild.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("set")
                .setDescription("Set a user's nickname.")
                .addUserOption(user =>
                    user
                        .setName("user")
                        .setRequired(true)
                        .setDescription("Select a user.")
                )
                .addStringOption(newNick =>
                    newNick
                        .setName("nickname")
                        .setDescription("New nickname for target user. Or leave empty to reset!")
                        .setRequired(false)
                        .setMaxLength(32)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("reset")
                .setDescription("Reset a user's nickname.")
                .addUserOption(user =>
                    user
                        .setName("user")
                        .setRequired(true)
                        .setDescription("Select a user.")
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (!interaction.inCachedGuild()) return interaction.reply({ content: "You must be inside a cached guild to use this command!", ephemeral: true })

        let color: ColorResolvable = await new Utilities().getEmbedColor(interaction.guild!);

        const focus = interaction.options.getSubcommand();

        let member = interaction.options.getMember("user")
        if (!member) return interaction.reply({ content: "Invalid user!", ephemeral: true })

        if (interaction.guild?.ownerId === member.id || member.roles.highest.position >= interaction.guild?.members.me?.roles.highest.position!) return interaction.reply({ content: "I am unable to edit their username!", });
        if (interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.reply({ content: "You cannot edit this user's nickname!", ephemeral: true })

        let newNick: string | null = null;
        let response = `You have reset **${member.user.tag}**'s nickname!`;
        let action = "Nickname Reset";

        if (focus == "set") {

            newNick = interaction.options.getString("nickname");
            response = `You have set **${member.user.tag}**'s nickname to \`${newNick}\`!`;
            action = "Nickname Set";

            return;
        }


        let oldNick = member.user.username;
        if (member.nickname) {
            oldNick = member.nickname;
        }

        member.setNickname(newNick).catch((err: Error) => {
            console.error(err);
        });

        const nickSet = new EmbedBuilder().setDescription(response).setColor(color);
        interaction.reply({ embeds: [nickSet] });

        new EmbedUtils().sendModLogs(
            {
                guild: interaction.guild,
                mod: interaction.member!,
                target: member,
                action: action,
            },
            { title: "Nickname Edited", actionInfo: `\`${oldNick}\` -> \`${newNick}\`` }
        );

    }
}