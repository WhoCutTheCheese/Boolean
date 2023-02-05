import { GatewayIntentBits, Client } from "discord.js";
import dotENV from "dotenv";
import { Utilities } from "./utils/Utilities";
dotENV.config();
const token = process.env.beta_token;

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
export class Main {

	getClient() {
		return client;
	}

}

new Utilities().registerCommands({ commandsFolder: "commands/slash", typescript: true, token: token! });
new Utilities().registerEvents({ eventFolder: "events", typescript: true });

client.login(token);