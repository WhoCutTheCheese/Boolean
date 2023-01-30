import { GatewayIntentBits, Client } from "discord.js";
import dotENV from "dotenv";
import { RegisterEvents } from "./utils/RegisterEvents";
import { RegisterCommands } from "./utils/RegisterCommands";
dotENV.config();
const token = process.env.token;

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

new RegisterEvents({ client: client, eventFolder: "events", typescript: true });
new RegisterCommands({ client: client, commandsFolder: "commands/slash", typescript: true, token: token! })

client.login(token);