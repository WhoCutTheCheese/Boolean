import { Client, Collection, PermissionsBitField, Routes } from "discord.js";
import Maintenance from "../schemas/Maintenance";
import path from "path";
import fs from "fs";
import { REST } from "@discordjs/rest";
declare module "discord.js" {
    export interface Client {
        commands: Collection<unknown, any>
        commandArray: [],
    }
}

export class RegisterCommands {
    constructor(args: {
        client: Client,
        commandsFolder: string,
        token: string,
        typescript: boolean
    }) {
        const { client, commandsFolder, typescript, token } = args;
        client.commands = new Collection();
        client.commandArray = [];
        const commandPath = path.join(__dirname, "..", commandsFolder);
        const commandFolders = fs.readdirSync(`./${commandsFolder}`);
        let fileExtension = ".js"
        if(typescript == true) {
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
        if(token == process.env.token) {
            clientId = "966634522106036265"
        } else if(token == process.env.beta_token) {
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
                if(!interaction.guild?.members.me?.permissions.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) return;
                const devs = ["493453098199547905", "648598769449041946", "585731185083285504"]
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
}