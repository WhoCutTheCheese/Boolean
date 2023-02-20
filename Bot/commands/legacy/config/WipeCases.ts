import { APIButtonComponent, ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Client, ColorResolvable, EmbedBuilder, Message, PermissionsBitField } from "discord.js";
import { Utilities } from "../../../utils/Utilities";
import * as config from '../../../config.json'
import Cases from "../../../schemas/Cases";
import Settings from "../../../schemas/Settings";


module.exports = {
    commands: ['wipecases', 'deleteallcases'],
    maxArgs: 0,
    cooldown: 3,
    userPermissions: [PermissionsBitField.Flags.Administrator],
    expectedArgs: "[@User/User ID]",
    commandCategory: "Configuration",
    callback: async (client: Client, message: Message, args: string[]) => {

        let row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("CONFIRM")
                    .setLabel("Confirm")
                    .setEmoji("🛑")
            )

        if (message.member?.id != message.guild?.ownerId || !config.devs.includes(message.author.id)) {
            const msg = await message.channel.send({ content: "You are unable to use this command." })
            setTimeout(() => {
                msg.delete().catch(() => { })
            }, 3000)
        }

        const settings = await new Utilities().getGuildSettings(message.guild!);
        if (!settings) return;

        let color: ColorResolvable = await new Utilities().getEmbedColor(message.guild!);

        const areYouSureEmbed = new EmbedBuilder()
            .setTitle("Warning!!!")
            .setDescription("This will delete ALL of Boolean's saved case data. This means Boolean will not longer be able to fetch any data on punishments issued.\n\n**Are you sure?**")
            .setColor(color)
        const buttonMessage = await message.channel.send({ embeds: [areYouSureEmbed], components: [row] })

        const filter = (i: any) => i.user.id === message.author.id;

        const collector = buttonMessage.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async (buttonInteraction: ButtonInteraction) => {
            if (buttonInteraction.customId == "CONFIRM") {
                if (buttonInteraction.user.id === message.author.id) {
                    row = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            ButtonBuilder.from(buttonMessage.components[0].components[0] as APIButtonComponent).setDisabled(true)
                        )
                    const areYouSureEmbed = new EmbedBuilder()
                        .setTitle("Deleted All Cases")
                        .setDescription("All saved punishment data has been wiped.")
                        .setColor(color)
                    buttonMessage.delete()
                    await buttonInteraction.reply({ embeds: [areYouSureEmbed], components: [row as ActionRowBuilder<ButtonBuilder>] })
                    await Settings.findOneAndUpdate({
                        guildID: message.guild?.id
                    }, {
                        guildSettings: {
                            totalCases: 0
                        }
                    })
                    await Cases.deleteMany({
                        guildID: message.guild?.id
                    })
                }
            }
        })


    }
}