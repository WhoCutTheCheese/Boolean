import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, ColorResolvable, EmbedBuilder, Message } from "discord.js";
import Configuration from "../../models/config";
const bot = require("../../package.json");

module.exports = {
    commands: ['botinfo', 'bot', 'info'],
    callback: async (client: Client, message: Message, args: string[]) => {

        const configuration = await Configuration.findOne({
            guildID: message.guild?.id
        })
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Invite Me!")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://discord.com/oauth2/authorize?client_id=966634522106036265&permissions=1377007168710&scope=bot%20applications.commands")
            )
        const botInfo = new EmbedBuilder()
            .setAuthor({ name: "Boolean Info", iconURL: client.user?.displayAvatarURL() || undefined })
            .setColor(configuration?.embedColor as ColorResolvable)
            .addFields(
                { name: "<:discovery:996115763842785370> Name:", value: `\`${client.user?.tag}\``, inline: true },
                { name: "<:stage:996115761703702528> Team:", value: `\`Creator:\` <@493453098199547905>\n\`Contributor(s):\` <@648598769449041946>`, inline: true },
                { name: "<:blurple_shield:996115768154525827> Guilds:", value: `\`${client.guilds.cache.size.toLocaleString()}\``, inline: true },
                { name: "<:gears:996115762848747530> Created:", value: `<t:${Math.floor(client.user!.createdAt.getTime() / 1000)}:D>`, inline: true },
                { name: "<:staff:996115760579620974> Version:", value: `\`v${bot.version}\``, inline: true },
                { name: "<:thread:996116357269692526> Library:", value: "`discord.js`", inline: true },
            )
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
        message.channel.send({ embeds: [botInfo], components: [row] })   
    
    },
}