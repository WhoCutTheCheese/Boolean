import { Client, ColorResolvable, EmbedBuilder, GuildChannel, GuildChannelResolvable, Message, PermissionsBitField, TextChannel, User } from "discord.js";
import Settings from "../../models/settings";

module.exports = {
    commands: ['unlock', 'ul'],
    minArgs: 0,
    maxArgs: 1,
    expectedArgs: "(#Channel/Channel ID)",
    commandName: "UNLOCK",
    commandCategory: "MODERATION",
    callback: async (client: Client, message: Message, args: string[]) => {

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if (!settings) return message.channel.send({ content: "Sorry, your settings file doesn't exist! If this error persists contact support" })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

        const channel = message.mentions.channels.first() || message.guild?.channels.cache.get(args[0]);

        if (channel) {

            const locked = new EmbedBuilder()
                .setColor(color)
                .setDescription(`<:yes:979193272612298814> Channel unlocked!`);
            (channel as TextChannel).send({ embeds: [locked] })

            message.react("<:yes:979193272612298814>")

            const modLogs = new EmbedBuilder()
                .setAuthor({ name: `Channel Unlocked`, iconURL: message.author.displayAvatarURL() || undefined })
                .setDescription(`<:folder:977391492790362173> **Mod:** ${message.author.tag}
                > [${message.author.id}]
                > [<@${message.author.id}>]

                <:pencil:977391492916207636> **Action:** Unlock

                **Channel:** <#${(channel as TextChannel)?.id}>
                **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                .setColor(color)
                .setTimestamp()
            const channel1 = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel!);
            let exists = true
            if (!channel1) { exists = false; }
            if (exists == true) {
                if (message.guild?.members.me?.permissionsIn((channel1! as TextChannel)).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                    (message.guild?.channels.cache.find((c: any) => c.id === channel1?.id) as TextChannel).send({ embeds: [modLogs] })
                }
            }
            ((channel as TextChannel).permissionOverwrites).edit((channel as TextChannel).guild.id, {
                SendMessages: null
            }).catch((err: Error) => {
                console.error(err)
                message.channel.send({ content: "I could not unlock this channel!" })});
            return;

        }
        const locked = new EmbedBuilder()
            .setColor(color)
            .setDescription(`<:yes:979193272612298814> Channel unlocked!`)
        message.channel.send({ embeds: [locked] })

        const modLogs = new EmbedBuilder()
            .setAuthor({ name: `Channel Unlocked`, iconURL: message.author.displayAvatarURL() || undefined })
            .setDescription(`<:folder:977391492790362173> **Mod:** ${message.author.tag}
            > [${message.author.id}]
            > [<@${message.author.id}>]

            <:pencil:977391492916207636> **Action:** Unlock

            **Channel:** <#${message.channel?.id}>
            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
            .setColor(color)
            .setTimestamp()
        const modLogChannel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel!);
        let exists = true
        if (!modLogChannel) { exists = false; }
        if (exists == true) {
            if (message.guild?.members.me?.permissionsIn(modLogChannel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                (message.guild?.channels.cache.find((c: any) => c.id === modLogChannel?.id) as TextChannel).send({ embeds: [modLogs] })
            }
        }
        ((message.channel as TextChannel).permissionOverwrites).edit((message.channel as TextChannel).guild.id, {
            SendMessages: null
        }).catch((err: Error) => {
            console.error(err)
            message.channel.send({ content: "I could not unlock this channel!" })});


    },
}