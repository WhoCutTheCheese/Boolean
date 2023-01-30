import { Client, ColorResolvable, EmbedBuilder, Message, PermissionsBitField, TextChannel } from "discord.js"
import Settings from "../../schemas/Settings";
let prefix: string | undefined
import Maintenance from "../../schemas/Maintenance";

const allCommands = {} as {
    [key: string]: any
}

module.exports = (commandOptions: { commands: string[] }) => {
    let {
        commands,
    } = commandOptions
    if (typeof commands === 'string') {
        commands = [commands]
    }
    for (const command of commands) {
        allCommands[command] = {
            ...commandOptions,
            commands,
        }
    }
}
let set = new Set()
module.exports.listen = (client: Client) => {
    client.on("messageCreate", async (message: Message) => {
        try {
            if (!message.inGuild) return;
            if (!message.guild?.members.me?.permissions.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) return;
            if (!(message.channel as TextChannel).permissionsFor(message.guild?.members.me!)?.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) return;

            const settings = await Settings.findOne({
                guildID: message.guild?.id
            })
            if (!settings) return;
            
            let color: ColorResolvable = "5865F2" as ColorResolvable;
            if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

            prefix = settings.guildSettings?.prefix;
            if (!prefix) prefix = "!!";

            const args = message.content.split(/[ ]+/)
            const name = args.shift()!.toLowerCase();

            if (name.startsWith(prefix)) {
                const devs = ["493453098199547905", "648598769449041946", "585731185083285504"]
                const maintenance = await Maintenance.findOne({
                    botID: client.user?.id
                })
                if (maintenance) {
                    if (maintenance.maintenance == true) {
                        if (!devs.includes(message.author.id)) {
                            message.channel.send({ content: `**Uh Oh!** Boolean is currently under maintenance!\n**__Details:__** ${maintenance.maintainDetails}` })
                            return;
                        }
                    }
                }
                const command = allCommands[name.replace(prefix, '')]
                if (!command) {
                    return
                }
                let {
                    minArgs = 0,
                    maxArgs = null,
                    expectedArgs = "",
                    cooldown = 0,
                    devOnly = false,
                    commandCategory = null,
                    callback,
                } = command

                if (devOnly == true) {
                    if (!devs.includes(message.author.id)) {
                        message.channel.send({ content: "This command is for developers only." })
                        return
                    }
                }

                if (args.length < minArgs || (maxArgs !== null && args.length > maxArgs)) {
                    message.reply({ content: `Incorrect syntax! Use \`${name} ${expectedArgs}\`` })
                    return;
                }

                if (cooldown > 0) {
                    if (set.has(message.author.id)) {
                        message.channel.send({ content: `You must wait \`${cooldown} second(s)\` before using this command again!` })
                        return;
                    } else {
                        set.add(message.author.id);
                        setTimeout(() => {
                            set.delete(message.author.id);
                        }, cooldown * 1000);
                    }
                }

                if (message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                    if ((message.channel as TextChannel).permissionsFor(message.guild.members.me!)?.has(PermissionsBitField.Flags.ManageMessages)) {
                        if (settings.modSettings?.deleteCommandUsage == true) {
                            if (message.deletable) {
                                setTimeout(() => {
                                    message.delete
                                }, 3000)
                            }
                        }
                    }
                }

                callback(client, message, args, args.join(' '))

            }

        } catch (err) {
            if (message.guild?.members.me?.permissions.has(PermissionsBitField.Flags.SendMessages)) {
                message.channel.send({ content: "I encountered an error! Please try again. If this persists, join our support server!" })
                console.log(err)
                return;
            }
        }
    })
}