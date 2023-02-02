import { ChatInputCommandInteraction, Client, ColorResolvable, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Settings from "../../../schemas/Settings";
import { Utilities } from "../../../utils/Utilities";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Get a larger version of a user's avatar.")
        .addUserOption(user =>
            user.setName("user")
                .setDescription("Input any user on Discord.")
                .setRequired(false)
        ),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if(!interaction.inCachedGuild()) return interaction.reply({ content: "You must be inside a cached guild to use this command!", ephemeral: true })
        
        const settings = await Settings.findOne({
            guildID: interaction.guild?.id
        })
        if (!settings) {
            await new Utilities().createFile({ guild: interaction.guild! });
            interaction.reply({ content: "Sorry, your settings file doesn't exist! If this error persists contact support", ephemeral: true });
            return;
        }
        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

        let user = interaction.options.getUser("user");
        if(!user) {
            user = interaction.user
        }

        let avatarEmbed = new EmbedBuilder()
            .setAuthor({ name: `${user.tag}'s Avatar`, iconURL: user.displayAvatarURL() || undefined})
            .setColor(color)
            .setImage(user.displayAvatarURL({ size: 512 }) || null)
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() || undefined })
        interaction.reply({ embeds: [avatarEmbed] })
    
    }
}