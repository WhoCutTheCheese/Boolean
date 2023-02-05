import { Client, Message } from "discord.js";
module.exports = {
	commands: ['ping', 'latency'],
	commandCategory: "User",
	cooldown: 1,
	callback: async (client: Client, message: Message, args: string[]) => {
		const pingMessage = await message.channel.send({ content: "🔃 Calculating..." })
		const ping = pingMessage.createdTimestamp - message.createdTimestamp
		pingMessage.edit({ content: `<:check:1069088768830738554> Bot Latency: **${ping}ms**, API Latency: **${client.ws.ping}ms**` })
	},
}