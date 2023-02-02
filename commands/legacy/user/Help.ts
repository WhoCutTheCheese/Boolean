
import { Client, ColorResolvable, EmbedBuilder, Message, User } from "discord.js";
import fs from "fs";
import path from "path";
import Settings from "../../../schemas/Settings";
import { Utilities } from "../../../utils/Utilities";
const bot = require("../../../package.json");

module.exports = {
    commands: ['help', 'cmd', 'cmds', 'commands', 'omgpleasehelpmeimgoingtoexplode'],
    callback: async (client: Client, message: Message, args: string[]) => {

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if (!settings) {
            new Utilities().createFile({ guild: message.guild! });
            message.channel.send({ content: "Sorry, your settings file doesn't exist! If this error persists contact support" });
            return;
        }
        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

        let user: string[] = []
        let moderation: string[] = []
        let configuration: string[] = []

        const baseFile = 'CommandBase.ts'
        const getCommand = (dir: string) => {
            const files = fs.readdirSync(path.join(__dirname, dir))
            for (const file of files) {
                const stat = fs.lstatSync(path.join(__dirname, dir, file))
                if (stat.isDirectory()) {
                    getCommand(path.join(dir, file))
                } else if (file !== baseFile) {
                    const option = require(path.join(__dirname, dir, file))
                    if(option.commandCategory == "User") {
                        user.push(` \`${file.replace(".ts", "").toLowerCase()}\``)
                    } else if(option.commandCategory == "Moderation") {
                        moderation.push(` \`${file.replace(".ts", "").toLowerCase()}\``)
                    } else if(option.commandCategory == "Configuration") {
                        configuration.push(` \`${file.replace(".ts", "").toLowerCase()}\``)
                    }
                }
            }
        }
        getCommand("../../legacy");
        if(moderation.length === 0) {
            moderation.push("Nothing...");
        }
        if(user.length === 0) {
            user.push("Nothing...");
        }
        if(configuration.length === 0) {
            configuration.push("Nothing...");
        }

        let prefix: string = "!!"
        if (settings.guildSettings?.prefix) {
            prefix = settings.guildSettings.prefix
        }

        let premium: string = "false"
        if (settings.guildSettings?.premium == true) {
            premium = "true"
        }
        const helpEmbed = new EmbedBuilder()
            .setTitle("<:tasklist:967443053063327774> Help\n")
            .setThumbnail(message.guild?.iconURL() || null)
            .setDescription("<a:coin:893603823459905536> **[Premium](https://google.com)** | :newspaper: **[Features](https://google.com/)** | <:BugHunderLv2:1044190719943913502> **[Support Server](https://discord.gg/VD4sf98hKd)**")
            .addFields(
                { name: "Current Guild Settings", value: `Prefix: \`${prefix}\`\nEmbed Color: \`#${color}\`\nPremium Status: \`${premium}\`` },
                { name: "User Commands", value: `${user}`, inline: false },
                { name: "Moderation Commands", value: `${moderation}`, inline: false },
                { name: "Config Commands", value: `${configuration}`, inline: false }
            )
            .setColor(color)
            .setFooter({ text: `${message.guild?.name} - v${bot.version}`, iconURL: message.guild?.iconURL() || undefined })
        message.channel.send({ embeds: [helpEmbed] })

    }
}