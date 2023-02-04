import { Client, ColorResolvable, EmbedBuilder, Message, PermissionResolvable, PermissionsBitField, TextChannel, time } from 'discord.js';
import Settings from "../../schemas/Settings";
let prefix: string | undefined
import Maintenance from "../../schemas/Maintenance";
import { Utilities } from "../../utils/Utilities";
import { EmbedUtils } from '../../utils/EmbedUtils';

const devs = ["493453098199547905", "648598769449041946", "585731185083285504", "296823576156307467", "539280098574991370"]

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

const cooldowns: Map<string, Map<string, number>> = new Map();
module.exports.listen = (client: Client) => {
    client.on("messageCreate", async (message: Message) => {
        try {
            if (!message.inGuild) return;
            if (!message.guild?.members.me?.permissions.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) return;
            if (!(message.channel as TextChannel).permissionsFor(message.guild?.members.me!)?.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) return;

            const settings = await Settings.findOne({
                guildID: message.guild?.id
            })
            if (!settings) {
                new Utilities().createFile({ guild: message.guild! });
                message.channel.send({ content: "Sorry, your settings file doesn't exist! If this error persists contact support." });
                return;
            }

            let color: ColorResolvable = "5865F2" as ColorResolvable;
            if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

            prefix = settings.guildSettings?.prefix;
            if (!prefix) prefix = "!!";

            const args = message.content.split(/[ ]+/)
            const name = args.shift()!.toLowerCase();

            if (!name.startsWith(prefix)) return;
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
                description = "",
                subCommands = [],
                botPermissions = [],
                userPermissions = [],
                callback,
            } = command

            if (devOnly == true) {
                if (!devs.includes(message.author.id)) {
                    message.channel.send({ content: "This command is for developers only." })
                    return
                }
            }

            if ((botPermissions as Array<PermissionsBitField>).length > 0) {

                let missingPerm: Boolean = false

                for (let perm of botPermissions) {

                    if (!message.guild?.members?.me?.permissions.has(perm, true)) {
                        missingPerm = true
                    }

                    if (!(message.channel as TextChannel).permissionsFor(message.guild?.members.me!)?.has(perm, true)) {
                        missingPerm = true
                    };
                }

                if (missingPerm) {
                    message.channel.send({ content: `I am missing the permissions to run this command :(` })
                    return;
                }
            }

            if ((userPermissions as Array<PermissionsBitField>).length > 0) {

                let missingPerm: Boolean = false

                for (let perm of botPermissions) {

                    if (!message.member?.permissions.has(perm, true)) {
                        missingPerm = true
                    }

                    if (!(message.channel as TextChannel).permissionsFor(message.member!)?.has(perm, true)) {
                        missingPerm = true
                    };
                }

                if (missingPerm) {
                    new EmbedUtils().sendErrorEmbed((message.channel as TextChannel), message, { errorEmoji: false, replyToMessage: true, deleteMsg: true }, { title: "No permissions", description: `You do not have the correct permissions required to run this command.` })
                    return;
                }

            }

            if (args.length < minArgs || (maxArgs !== null && args.length > maxArgs)) {
                new EmbedUtils().sendErrorEmbed((message.channel as TextChannel), message, { errorEmoji: false, replyToMessage: false, deleteMsg: true }, { title: "Invalid syntax", description: `Please use \`${name} ${expectedArgs}\`` })
                return;
            }

            if (cooldown > 0) {
                let userId = message.author.id

                if (!cooldowns.has(command)) {
                    cooldowns.set(command, new Map());
                }

                const now = Math.floor(Date.now() / 1000);
                const timestamps = cooldowns.get(command);
                if (timestamps!.get(userId)) {
                    let remainingTime = timestamps!.get(userId)! + cooldown - now;

                    if (remainingTime > 0) {
                        message.channel.send({ content: `You must wait \`${remainingTime} second(s)\` before using this command again!` })
                        return;
                    } else {
                        timestamps?.delete(userId)
                    }
                } else {
                    timestamps!.set(userId, now);
                }
            }

            // if (cooldown > 0) {
            //     console.log(Math.floor(Date.now() / 1000) - set[message.author.id].Time)

            //     let nameNoPrefix = name.replace(prefix, "")

            //     if ((set[message.author.id] && nameNoPrefix === set[message.author.id].Command) && (Math.floor(Date.now() / 1000) - set[message.author.id].Time < cooldown)) {
            //         message.channel.send({ content: `You must wait \`${Math.floor(Date.now() / 1000) - set[message.author.id]} second(s)\` before using this command again!` })
            //         return;
            //     }else if () {

            //     }else if (!set[message.author.id]) {
            //         set[][message.author.id] = {Command: name.replace(prefix, ""), Time: Math.floor(Date.now() / 1000)}
            //     }
            // }

            if (message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                if ((message.channel as TextChannel).permissionsFor(message.guild.members.me!)?.has(PermissionsBitField.Flags.ManageMessages)) {
                    if (settings.modSettings?.deleteCommandUsage == true) {
                        if (message.deletable) {
                            setTimeout(() => {
                                try {
                                    message.delete
                                } catch (err) { }
                            }, 3000)
                        }
                    }
                }
            }

            try {
                callback(client, message, args, args.join(' '))
            } catch (err) {
                message.reply({ content: "Error" });
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