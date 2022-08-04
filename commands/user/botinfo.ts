import { ICommand } from "wokcommands";
import { MessageEmbed } from "discord.js";
import Config from "../../models/config";
const bot = require("../../package.json");
export default {
    category: "User",
    description: "Get information on Boolean.",
    slash: "both",
    aliases: ['bot'],
    maxArgs: 0,
    cooldown: "3s",

    callback: async ({ message, interaction, client }) => {
        try {
        if (message) {
            const configuration = await Config.findOne({
                guildID: message.guild?.id
            })
            const botInfo = new MessageEmbed()
                .setAuthor({ name: "Boolean Info", iconURL: client.user?.displayAvatarURL({ dynamic: true }) })
                .setColor(configuration.embedColor)
                .addField("<:discovery:996115763842785370> Name:", `\`${client.user?.username}\``, true)
                .addField("<:stage:996115761703702528> Team:", `\`Creator:\` <@493453098199547905>\n\`Contributor:\` <@648598769449041946>`, true)
                .addField("<:blurple_shield:996115768154525827> Guilds:", `\`${client.guilds.cache.size.toLocaleString()}\``, true)
                .addField("<:gears:996115762848747530> Created:", `<t:${Math.floor(client.user!.createdAt.getTime() / 1000)}:D>`, true)
                .addField("<:staff:996115760579620974> Version:", `\`v${bot.version}\``, true)
                .addField("<:thread:996116357269692526> Library:", `\`discord.js\``, true)
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            message.channel.send({ embeds: [botInfo] })
            return true;
        } else if (interaction) {
            const configuration = await Config.findOne({
                guildID: interaction.guild?.id
            })
            const botInfo = new MessageEmbed()
                .setAuthor({ name: "Boolean Info", iconURL: client.user?.displayAvatarURL({ dynamic: true }) })
                .setColor(configuration.embedColor)
                .addField("<:discovery:996115763842785370> Name:", `\`${client.user?.username}\``, true)
                .addField("<:stage:996115761703702528> Team:", `\`Creator:\` <@493453098199547905>\n\`Contributor:\` <@648598769449041946>`, true)
                .addField("<:blurple_shield:996115768154525827> Guilds:", `\`${client.guilds.cache.size}\``, true)
                .addField("<:gears:996115762848747530> Created:", `<t:${Math.floor(client.user!.createdAt.getTime() / 1000)}:D>`, true)
                .addField("<:staff:996115760579620974> Version:", `\`v${bot.version}\``, true)
                .addField("<:thread:996116357269692526> Library:", `\`discord.js\``, true)
                .setFooter({ text: `Requested by ${interaction.user?.tag}`, iconURL: interaction.user?.displayAvatarURL({ dynamic: true }) })
            interaction.reply({ embeds: [botInfo] })
        }
    } catch {
        (err: Error) => {
            console.error(err);
            return "An error occurred running this command! If this persists PLEASE contact us.";
        }
    }
    }
} as ICommand