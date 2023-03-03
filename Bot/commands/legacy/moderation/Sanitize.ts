import { PermissionsBitField, Client, Message, ColorResolvable, EmbedBuilder } from "discord.js";
import { BooleanCommand } from "../../../interface/BooleanCommand";
import { Utilities } from "../../../utils/Utilities";
import { weirdToNormalChars } from "weird-to-normal-chars";
import { EmbedUtils } from "../../../utils/EmbedUtils";
import Cases from "../../../schemas/Cases";
import { Log } from "../../../utils/Log";

const command: BooleanCommand = {
    command: "sanitize",
    aliases: ["dehoist", "s"],
    description: "Convert special character in a user's nickname to normal characters. Also will de-hoist people.",
    minArgs: 1,
    expectedArgs: "[@User/User ID] [Reason]",
    botPermissions: [PermissionsBitField.Flags.ManageNicknames],
    userPermissions: [PermissionsBitField.Flags.ManageNicknames],
    commandCategory: "Moderation",
    callback: async (client: Client, message: Message, args: string[]) => {

        if (!message.guild?.members?.me) {
            message.channel.send({ content: "This command can only be used in a guild", });
            return;
        }

        let color: ColorResolvable = await new Utilities().getEmbedColor(message.guild!);
        const reason = args.splice(1).join(" ") ?? "No reason provided.";
        const user = message.mentions.members?.first() ||
            (await message.guild?.members.fetch(args[0]).catch(() => { }));
        if (!user)
            return message.channel.send({ content: "Unable to fetch that member! Please try again.", });

        if (message.guild?.ownerId === user.id || user.roles.highest.position >= message.guild.members.me.roles.highest.position)
            return message.channel.send({
                content: "I am unable to edit their username!",
            });

        const before = user.user.username;
        let after = user.user.username;

        after = weirdToNormalChars(after)
        if (after.startsWith("!")) {
            after = after.substring(1);
        }

        const caseNumberSet = await new Utilities().incrementCaseCount(message.guild!);

        user.setNickname(after).catch((err: Error) => {
            console.error(err);
            message.channel.send({ content: "An unknwon error occurred! If this issue persists, please join our support server.", });
        });

        const sanitized = new EmbedBuilder().setDescription(`You have santized \`${user.user.tag}\`'s name.\n**New Nickname:** ${after}`).setColor(color);
        message.channel.send({ embeds: [sanitized] });

        new EmbedUtils().sendModLogs(
            {
                guild: message.guild,
                mod: message.member!,
                target: user,
                action: "Username Sanitized",
            },
            { title: "Username Sanitized", actionInfo: `\`${before}\` -> \`${after}\`` }
        );

        const newCase = new Cases({
            guildID: message.guild.id,
            userID: user.id,
            modID: message.author.id,
            caseID: caseNumberSet,
            action: "Username Sanitized",
            caseDetails: {
                reason: reason,
                length: "None",
                date: Date.now(),
            }
        })
        newCase.save().catch((err: Error) => { Log.error("An error occurred in legacy/moderation/Sanitize.ts\n\n" + err) })


    }
}

export = command;