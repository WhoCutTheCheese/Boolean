import { ActivityType, Client } from "discord.js"
import mongoose from "mongoose";
import dotEnv from "dotenv";
import fs from "fs";
import path from "path";
import { Log } from "../utils/Log";
dotEnv.config()

let statuses = ["nothing", "the Aether", "you", "the stars", "space", "your server"]
module.exports = {
	name: "ready",
	once: false,
	async execute(client: Client) {

		Log.info("Boolean is starting...")

		client.user?.setPresence({
			activities: [{ name: `${statuses[Math.floor(Math.random() * 5)]} | !!help & (/) commands`, type: ActivityType.Watching }],
			status: "dnd"
		})

		mongoose.set("strictQuery", true);
		await mongoose.connect(`${process.env.mongo_url}`, {
			keepAlive: true,
		}, async () => {
			Log.debug("MongoDB has connected!")
		})

		Log.info("Boolean has successfully started")

	}
}