import { Client, Message, TextChannel, Permissions } from "discord.js";
import ErrorLog from "../../functions/errorlog";
module.exports = {
    commands: ['purge', 'clear'],
    minArgs: 1,
    maxArgs: 1,
    userPermission: ["MANAGE_MESSAGES"],
    staffPart: "Mod",
    expectedArgs: "[Limit]",
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        try {
            if (!message.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
                return message.channel.send({ content: "I don't have permission to delete messages! Run **!!check** to finish setting me up!" })
            }
            var amount = parseInt(args[0])

            if (!amount) { return message.channel.send({ content: "Please specify the amount of messages you want me to delete" }) }
            if (amount > 100 || amount < 1) { return message.channel.send({ content: "Number must be between 1 - 100" }) }
            let messages = await message.channel.messages.fetch({ limit: amount });
            (message.channel as TextChannel).bulkDelete(messages).catch((err: Error) => {
                message.channel.send({ content: ':x: Due to Discord Limitations, I cannot delete messages older than 14 days' })
            })
            ModLog(false, 0, message.guild?.id, "Purge", message.author.id, message, client, Date.now())


            let msg = await message.channel.send({ content: `Deleted \`${amount}\` messages` })
            setTimeout(() => {
                msg.delete()
            }, 3000)
        } catch {
            (err: Error) => {
                ErrorLog(message.guild!, "PURGE_COMMAND", err, client, message, `${message.author.id}`, `purge.ts`)
            }
        }
    },
}