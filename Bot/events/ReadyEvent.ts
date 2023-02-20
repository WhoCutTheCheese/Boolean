import { ActivityType, Client } from "discord.js"
import mongoose from "mongoose";
import dotEnv from "dotenv";
import fs from "fs";
import path from "path";
import { Log, LogLevel } from "../utils/Log";
dotEnv.config()

let statuses = ["nothing", "the Aether", "you", "the stars", "space", "your server"]
module.exports = {
	name: "ready",
	once: false,
	async execute(client: Client) {

		Log(LogLevel.Info, "Boolean is starting...")

		client.user?.setPresence({
			activities: [{ name: `${statuses[Math.floor(Math.random() * 5)]} | !!help & (/) commands`, type: ActivityType.Watching }],
			status: "dnd"
		})

		mongoose.set("strictQuery", true);
		mongoose.connect(`${process.env.mongo_url}`, {
			keepAlive: true,
		}, () => {
			Log(LogLevel.Debug, "MongoDB has connected!")
		})

		const baseFile = 'CommandBase.ts'
		const commandBase = require(`../commands/legacy/CommandBase.ts`);
		const readCommands = (dir: string) => {
			const files = fs.readdirSync(path.join(__dirname, dir))
			for (const file of files) {
				const stat = fs.lstatSync(path.join(__dirname, dir, file))
				if (stat.isDirectory()) {
					readCommands(path.join(dir, file))
				} else if (file !== baseFile) {
					const option = require(path.join(__dirname, dir, file))
					commandBase(option)
				}
			}
		}


		readCommands('../commands/legacy/')
		commandBase.listen(client);

		Log(LogLevel.Info, "Boolean is coding the future!")

	}
}