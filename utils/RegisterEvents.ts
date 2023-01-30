import { Client } from "discord.js";
import path from "path";
import fs from "fs";

export class RegisterEvents {
    constructor(args: {
        client: Client,
        eventFolder: string,
        typescript: boolean
    }) {
        const { client, eventFolder, typescript } = args;
        const eventPath = path.join(__dirname, "..", eventFolder);
        let fileExtension = ".js"
        if(typescript == true) {
            fileExtension = ".ts"
        }
        const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith(fileExtension));
        for (const file of eventFiles) {
            const filePath = path.join(eventPath, file);
            const event = require(filePath);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        }
    }
}