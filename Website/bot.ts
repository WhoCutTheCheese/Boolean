import { GatewayIntentBits, Client } from "discord.js";
import dotENV from "dotenv";
dotENV.config();
const token = process.env.token || process.env.beta_token;
// const token = process.env.token;

const client = new Client({
	intents: [
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
	]
});

//Since Boolean's code is public now, I just like how classes look in code. I know it's basically completely useless :D
export default client

client.login(token);