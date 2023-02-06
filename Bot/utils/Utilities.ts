import { Collection, Guild, PermissionsBitField, REST, Routes, ColorResolvable, Embed, EmbedBuilder, MessageType, Message, User } from 'discord.js';
import path from "path";
import fs from "fs";
import Maintenance from "../schemas/Maintenance";
import { Main } from "../index";
import Settings from "../schemas/Settings";
import * as config from '../config.json'
import Cases from '../schemas/Cases';

declare module "discord.js" {
	export interface Client {
		commands: Collection<unknown, any>
		commandArray: [],
	}
}

export class Utilities {
	registerEvents(args: {
		eventFolder: string,
		typescript: boolean
	}) {
		const { eventFolder, typescript } = args;
		const client = new Main().getClient();
		const eventPath = path.join(__dirname, "..", eventFolder);
		let fileExtension = ".js"
		if (typescript == true) {
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

	registerCommands(args: {
		commandsFolder: string,
		token: string,
		typescript: boolean
	}) {
		const { commandsFolder, typescript, token } = args;
		const client = new Main().getClient();
		client.commands = new Collection();
		client.commandArray = [];
		const commandPath = path.join(__dirname, "..", commandsFolder);
		const commandFolders = fs.readdirSync(`./${commandsFolder}`);
		let fileExtension = ".js"
		if (typescript == true) {
			fileExtension = ".ts"
		}
		for (const folder of commandFolders) {
			const commandFiles = fs.readdirSync(`${commandPath}/${folder}`).filter(file => file.endsWith(fileExtension));

			for (const files of commandFiles) {
				const command = require(`${commandPath}/${folder}/${files}`)

				client.commands.set(command.data.name, command)
				client.commandArray.push(command.data.toJSON() as never)
			}
		}
		let clientId
		if (token == process.env.token) {
			clientId = "966634522106036265"
		} else if (token == process.env.beta_token) {
			clientId = "996609716748832768"
		}

		const rest = new REST({ version: '10' }).setToken(`${token}`);

		(async () => {
			try {
				console.log('Started refreshing application (/) commands.');

				await rest.put(
					Routes.applicationCommands(clientId as string),
					{ body: client.commandArray },
				);

				console.log('Successfully reloaded application (/) commands.');
			} catch (error) {
				console.error(error);
			}
		})();

		client.on("interactionCreate", async interaction => {
			if (!interaction.isChatInputCommand()) return;
			const command = client.commands.get(interaction.commandName);

			if (!command) return;

			try {
				if (!interaction.guild?.members.me?.permissions.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) return;
				const devs = config.devs;
				const maintenance = await Maintenance.findOne({
					botID: client.user?.id
				})
				if (maintenance) {
					if (maintenance.maintenance == true) {
						if (!devs.includes(interaction.user.id)) {
							interaction.reply({ content: `**Uh Oh!** Boolean is currently under maintenance!\n**__Details:__** ${maintenance.maintainDetails}`, ephemeral: true })
							return;
						}
					}
				}
				await command.execute(interaction, client);
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true }).catch((err: Error) => console.log(err))
			}
		})
	}

	async createFile(args: { guild: Guild }) {
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

	async getGuildSettings(guild: Guild | null) {
		if (!guild || !guild.id) return null;
		return await Settings.findOne({ guildID: guild.id });
	}

	async getEmbedColor(guild: Guild | null): Promise<ColorResolvable> {
		const settings = await this.getGuildSettings(guild!)
		let color: ColorResolvable = "5865F2" as ColorResolvable;
		if (!settings) return color;
		if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;
		return color
	}


	async warnCount(user: User): Promise<number> {

		let num = await Cases.countDocuments({ userID: user.id, action: "Warn" });
		let num2 = await Cases.countDocuments({ userID: user.id, action: "AutoMute" })
		num = num + num2;

		return num;

	}

	async updateCaseCount(guild: Guild): Promise<number | undefined> {
		const settings = await this.getGuildSettings(guild);
		if (!settings) return undefined;

		let caseNumberSet = undefined
		if (!settings.guildSettings?.totalCases) {
			caseNumberSet = 1;
		} else if (settings.guildSettings?.totalCases) {
			caseNumberSet = settings.guildSettings?.totalCases + 1;
		}
		await Settings.findOneAndUpdate({
			guildID: guild?.id,
		}, {
			guildSettings: {
				totalCases: caseNumberSet
			}
		})

		return caseNumberSet;

	}

}
