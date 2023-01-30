import { Guild } from "discord.js";
import Settings from "../schemas/Settings";

export async function createFile(args: { guild: Guild }) {
    let { guild } = args;

    const settings = await Settings.findOne({
        guildID: guild.id
    })
    if (!settings) {
        const newSettings = new Settings({
            guildID: guild.id,
        })
        newSettings.save().catch((err: Error) => { console.error(err) });
    }

}