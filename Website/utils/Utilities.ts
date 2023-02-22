import { Request, Response } from 'express';
import path from "path";
import fs from "fs";
import * as config from '../config.json'
import { Guild } from 'discord.js';
import ServerSchema from '../schema/ServerSchema';
import client from '../bot';
import { Log, LogLevel } from './Log';

function checkManager(permissions: string): boolean {
	const manageServerFlag = 0x00000020;
	const permissionsInt = parseInt(permissions);

	if ((permissionsInt & manageServerFlag) !== 0) {
		return true;
	} else {
		return false;
	}
}

export class Utilities {
	async handleError(error: Error) {
		let notice = 'A client error occurred: ' + error.message
		if (error.stack)
			notice += '\n' + error.stack
		Log.error(notice);
	}

	sendToInvite(guild: string | null, req: Request, res: Response) {
		res.redirect(config.botInvite.replace('[id]', process.env.client_id!).replace('[redirect]', config.inviteCallback))
	}

	async updateGuilds(guilds: any) {
		if (!guilds || !(guilds.length > 0)) return guilds;

		for (let guild of guilds) guild.isManager = checkManager(guilds.permissions_new || guild.permissions)
		guilds = guilds.filter((guild: any) => guild.isManager === true);

		for (let guild of guilds) guild.dbServer = await ServerSchema.findOne({ guildID: guild.id })
		guilds = guilds.sort((a: any, b: any) => a.dbServer === b.dbServer ? 0 : a.dbServer ? -1 : 1);

		// profile.guilds = profile.guilds.sort((a: any, b: any) => {
		// 	if (a.isManager === b.isManager) return 0;
		// 	return a.isManager ? -1 : 1;
		// });

		return guilds
	}
}
