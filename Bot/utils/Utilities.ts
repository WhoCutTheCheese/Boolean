import { Collection, Guild, PermissionsBitField, REST, Routes, ColorResolvable, Embed, EmbedBuilder, MessageType, Message, User, Client } from 'discord.js';
import path from "path";
import fs from "fs";
import Maintenance from "../schemas/Maintenance";
import { Main } from "../index";
import Settings from "../schemas/Settings";
import * as config from '../config.json'
import Cases from '../schemas/Cases';
import { Log, LogLevel } from './Log';
import { BooleanCommand } from '../interface/BooleanCommand';
import convert, { convertMany } from 'convert';

declare module "discord.js" {
	export interface Client {
		legacycommands: Collection<string, BooleanCommand>
		legacycommandalias: Collection<string, string>,
		legacycommandfilepath: Collection<string, string>,
		slashcommands: Collection<unknown, any>
		slashcommandsArray: [],
	}
}

export class Utilities {
	async handleError(error: Error) {
		let notice = 'A client error occurred: ' + error.message
		if (error.stack)
			notice += '\n' + error.stack
		Log(LogLevel.Error, notice);
	}

	async registerEvents(args: {
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

	async loadCommand(client: Client, commandpath: string): Promise<boolean> {
		try {
			const option: BooleanCommand = require(commandpath)

			delete require.cache[require.resolve(commandpath)];

			let { command, aliases } = option

			client.legacycommands.set(command.toLowerCase(), { ...option })
			client.legacycommandfilepath.set(command.toLowerCase(), commandpath)

			if (aliases) {
				for (const alias of aliases) {
					client.legacycommandalias.set(alias.toLowerCase(), command.toLowerCase())
					Log(LogLevel.Info, `[Alias]  | Command Alias | ${alias}`)
				}
			}

			return true;
		} catch (err) {
			console.error(err)
			return false;
		}
	}

	async registerLegacyCommands(args: {
		client: Client,
		commandsFolder: string,
		token: string,
	}) {
		const { client, commandsFolder, token } = args;
		client.legacycommands = new Collection();
		client.legacycommandalias = new Collection();
		client.legacycommandfilepath = new Collection();

		const baseFile = 'CommandBase.ts'
		const readCommands = async (dir: string) => {
			const files = fs.readdirSync(path.join(__dirname, dir))
			for (const file of files) {
				const stat = fs.lstatSync(path.join(__dirname, dir, file))
				if (stat.isDirectory()) {
					readCommands(path.join(dir, file))
				} else if (file !== baseFile) {
					Log(LogLevel.Info, `[Loading] | Legacy Command | ${file}`)
					let loaded = await this.loadCommand(client, path.join(__dirname, dir, file))
					if (loaded) Log(LogLevel.Info, `[Loaded]  | Legacy Command | ${file}`)
					else Log(LogLevel.Error, `There was an error loading ${file}`)
				}
			}
		}

		readCommands(`../${commandsFolder}`);
	}

	async registerShashCommands(args: {
		client: Client,
		commandsFolder: string,
		token: string,
		typescript: boolean,
	}) {
		const { client, commandsFolder, typescript, token } = args;
		client.slashcommands = new Collection();
		client.slashcommandsArray = [];
		const commandPath = path.join(__dirname, "..", commandsFolder);
		const commandFolders = fs.readdirSync(`./${commandsFolder}`);
		let fileExtension = ".js"
		if (typescript == true) {
			fileExtension = ".ts"
		}
		for (const folder of commandFolders) {
			const commandFiles = fs.readdirSync(`${commandPath}/${folder}`).filter(file => file.endsWith(fileExtension));

			for (const file of commandFiles) {

				Log(LogLevel.Info, `[Get] | Slash Command | ${file}`)

				const command = require(`${commandPath}/${folder}/${file}`)

				client.slashcommands.set(command.data.name, command)
				client.slashcommandsArray.push(command.data.toJSON() as never)

				Log(LogLevel.Info, `[Loaded]  | Slash Command | ${file}`)
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
				Log(LogLevel.Debug, "Registering all (/) commands.");

				await rest.put(
					Routes.applicationCommands(clientId as string),
					{ body: client.slashcommandsArray },
				);

				Log(LogLevel.Debug, "Registered all (/) commands");
			} catch (error) {
				console.error(error);
			}
		})();

		client.on("interactionCreate", async interaction => {
			if (!interaction.isChatInputCommand()) return;
			const command = client.slashcommands.get(interaction.commandName);

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
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true }).catch((err: Error) => Log(LogLevel.Error, "An error occurred while running a command!\n\n" + err.message))
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

	conertStringToTime(string: string, time: string): number | null {
		let lengthNum: number | null = null;
		try { lengthNum = convertMany(string).to('s'); }
		catch (err) { };

		return lengthNum;
	}

	async getEmbedColor(guild: Guild | null): Promise<ColorResolvable> {
		const settings = await this.getGuildSettings(guild!)
		let color: ColorResolvable = "5865F2" as ColorResolvable;
		if (!settings) return color;
		if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;
		return color
	}

	async getGuildPrefix(guild: Guild | null): Promise<string> {
		const settings = await this.getGuildSettings(guild!)
		return settings?.guildSettings?.prefix || "!!"
	}

	async warnCount(user: User): Promise<number> {

		let num = await Cases.countDocuments({ userID: user.id, action: "Warn" });
		let num2 = await Cases.countDocuments({ userID: user.id, action: "AutoMute" })
		num = num + num2;

		return num;

	}

	async incrementCaseCount(guild: Guild): Promise<number | undefined> {
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
