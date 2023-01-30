import { Client, Guild } from "discord.js";
import Settings from "../schemas/Settings";
import { createFile } from "../utils/CreateFile";

module.exports = {
    name: "guildCreate",
    once: false,
    async execute(client: Client, guild: Guild) {

        createFile({ guild: guild })

    }
}