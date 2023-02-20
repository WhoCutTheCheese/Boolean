import { GatewayIntentBits, Client } from "discord.js";
import dotENV from "dotenv";
import { Utilities } from "./utils/Utilities";
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

export class Main {

	getClient() {
		return client;
	}

	getToken() {
		return token;
	}

}

new Utilities().registerEvents({ eventFolder: "events", typescript: true });
new Utilities().registerLegacyCommands({ client, commandsFolder: "commands/legacy", token: token! })
new Utilities().registerShashCommands({ client, commandsFolder: "commands/slash", typescript: true, token: token! });
import './commands/legacy/CommandBase'

process.on('unhandledRejection', (error: Error) => new Utilities().handleError(error));
process.on('uncaughtException', (error: Error) => new Utilities().handleError(error));
client.on("error", (error: Error) => new Utilities().handleError(error))

client.login(token);