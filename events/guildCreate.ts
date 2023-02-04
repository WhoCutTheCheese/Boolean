import { Guild } from "discord.js";
import { Utilities } from "../utils/Utilities";

module.exports = {
    name: "guildCreate",
    once: false,
    async execute(guild: Guild) {

        await new Utilities().createFile({ guild: guild })

    }
}