import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, Client } from "discord.js";


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



    }
}