import { Client, Message, MessageEmbed, Permissions } from "discord.js";
import automodConfig from "../models/automodConfig";
import Guild from "../models/guild";
import Config from "../models/config";
import Cases from "../models/cases";
const ms = require("ms");
const badlinks = require("../json/badlinks.json")

export = async function performAutomod(message: Message, client: Client) {
    const aConfig = await automodConfig.findOne({
        guildID: message.guild?.id,
    })
    const guild = await Guild.findOne({
        guildID: message.guild?.id,
    })
    const configuration = await Config.findOne({
        guildID: message.guild?.id,
    })
    if (!aConfig) { return; }
    const warns = await Cases.countDocuments({
        guildID: message.guild?.id,
        userID: message.author.id,
        caseType: "Warn",
    })
    let requiredRoles = []
    requiredRoles.push(configuration.modRoleID);
    requiredRoles.push(configuration.adminRoleID);
    if (message.member?.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) { return; }
    let hasRoles = false
    for (const requiredRole of requiredRoles) {
        if (!message.member?.roles.cache.has(requiredRole)) {
            hasRoles = false
        } else {
            hasRoles = true
            break;
        }
    }
    if (hasRoles == true) { return; }
    const caseNumberSet = guild.totalCases + 1;
    if (aConfig.blockLinks == true) {
        let getGoodContent = message.content
        for (const websites of aConfig.websiteWhitelist) {
            if (message.content.includes(websites)) {
                getGoodContent = message.content.replace(`${websites}`, "")
                break;
            }

        }
        if (/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi.test(getGoodContent)) {
            if (message.deletable) {
                let remainder
                if (warns !== 0) {
                    remainder = warns % configuration.warnsBeforeMute
                }
                if (remainder == 0) {
                    const newCases = await new Cases({
                        guildID: message.guild?.id,
                        userID: message.author.id,
                        modID: "------------------",
                        caseType: "Warn",
                        caseReason: "Sending unauthorized links. Automatic mute due to excessive warnings.",
                        caseNumber: caseNumberSet,
                        caseLength: "None",
                        date: Date.now(),
                    })
                    newCases.save()
                    const warnEmbed = new MessageEmbed()
                        .setDescription(`**Reason:** Sending a link to an unauthorized website.`)
                        .setColor(configuration.embedColor)
                    return message.reply({ content: "<:arrow_right:967329549912248341> You have been automatically muted.", embeds: [warnEmbed] }).then(msg => {
                        setTimeout(() => {
                            if (msg.deletable) {
                                msg.delete()
                            }
                        }, 10000)
                        message.delete().catch((err: Error) => console.error(err));
                        message.member?.timeout(ms("10m"), "Sending unauthorized links. Automatic mute due to excessive warnings.")
                    })
                }
                const newCases = await new Cases({
                    guildID: message.guild?.id,
                    userID: message.author.id,
                    modID: "------------------",
                    caseType: "Warn",
                    caseReason: "Sending unauthorized links.",
                    caseNumber: caseNumberSet,
                    caseLength: "None",
                    date: Date.now(),
                })
                newCases.save()
                const warnEmbed = new MessageEmbed()
                    .setDescription(`**Reason:** Sending a link to an unauthorized website.`)
                    .setColor(configuration.embedColor)
                return message.reply({ content: "<:arrow_right:967329549912248341> You have been warned.", embeds: [warnEmbed] }).then(msg => {
                    setTimeout(() => {
                        if (msg.deletable) {
                            msg.delete()
                        }
                    }, 10000)
                    message.delete().catch((err: Error) => console.error(err));
                })
            }
        }
    }

    //Scam Blocker
    if(aConfig.blockScams === true) {
        let isScammer = false
        if(!message.guild?.me?.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) { return; }
        for(const scams of badlinks) {
            if(message.content.toLowerCase().includes(scams.toLowerCase())) {
                isScammer = true
                break;
            }
        }
        if(isScammer == true) {
            const newCases = await new Cases({
                guildID: message.guild?.id,
                userID: message.author.id,
                modID: "------------------",
                caseType: "Ban",
                caseReason: "Sending scam links.",
                caseNumber: caseNumberSet,
                caseLength: "Permanent",
                date: Date.now(),
            })
            newCases.save()
            const warnEmbed = new MessageEmbed()
                    .setDescription(`**Reason:** Sending scan links.`)
                    .setColor(configuration.embedColor)
                return message.channel.send({ content: `<:arrow_right:967329549912248341> ${message.author.tag} has been banned.`, embeds: [warnEmbed] }).then(msg => {
                    setTimeout(() => {
                        if (msg.deletable) {
                            msg.delete()
                        }
                    }, 10000)
                    message.delete().catch((err: Error) => console.error(err));
                    if(message.member?.bannable) {
                        message.member?.ban({ reason: "Sending scam links", days: 7 })
                    }
                })
        }
    }

    //Mass Mentions
    if (aConfig.massMentions == true) {
        if (message.mentions.members!.size > aConfig.maxMentions) {
            if (message.deletable) {
                let remainder
                if (warns !== 0) {
                    remainder = warns % configuration.warnsBeforeMute
                }
                console.log(warns)
                console.log(remainder)
                if (remainder == 0) {
                    const newCases = await new Cases({
                        guildID: message.guild?.id,
                        userID: message.author.id,
                        modID: "------------------",
                        caseType: "Warn",
                        caseReason: "Exceeding max mentions. Automatic mute due to excessive warnings.",
                        caseNumber: caseNumberSet,
                        caseLength: "None",
                        date: Date.now(),
                    })
                    newCases.save()
                    const warnEmbed = new MessageEmbed()
                        .setDescription(`**Reason:** Exceeding max mentions.`)
                        .setColor(configuration.embedColor)
                    return message.reply({ content: "<:arrow_right:967329549912248341> You have been automatically muted.", embeds: [warnEmbed] }).then(msg => {
                        setTimeout(() => {
                            if (msg.deletable) {
                                msg.delete()
                            }
                        }, 10000)
                        message.delete().catch((err: Error) => console.error(err));
                        message.member?.timeout(ms("10m"), "Exceeding max mentions. Automatic mute due to excessive warnings.")
                    })
                }
                const newCases = await new Cases({
                    guildID: message.guild?.id,
                    userID: message.author.id,
                    modID: "------------------",
                    caseType: "Warn",
                    caseReason: "Exceeding max mentions.",
                    caseNumber: caseNumberSet,
                    caseLength: "None",
                    date: Date.now(),
                })
                newCases.save()
                const warnEmbed = new MessageEmbed()
                    .setDescription(`**Reason:** Exceeding max mentions.`)
                    .setColor(configuration.embedColor)
                return message.reply({ content: "<:arrow_right:967329549912248341> You have been warned.", embeds: [warnEmbed] }).then(msg => {
                    setTimeout(() => {
                        if (msg.deletable) {
                            msg.delete()
                        }
                    }, 10000)
                    message.delete().catch((err: Error) => console.error(err));
                })
            }
        }
    }
}