import { Client, Guild } from "discord.js";
import { Utilities } from "../utils/Utilities";

module.exports = {
    name: "guildCreate",
    once: false,
    async execute(client: Client, guild: Guild) {

        new Utilities().createFile({ guild: guild! });

    }
}