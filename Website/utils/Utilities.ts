import { Request, Response } from 'express';
import path from "path";
import fs from "fs";
import * as config from '../config.json'
import { Guild } from 'discord.js';
import ServerSchema from '../schema/ServerSchema';

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
	sendToInvite(guild: string | null, req: Request, res: Response) {
		res.redirect(config.botInvite.replace('[id]', process.env.client_id!).replace('[redirect]', config.inviteCallback))
	}

	async updateGuilds(guilds: any) {
		console.log(`UPDATEGUILDS FUNCTION | Guilds? ${guilds.length}`)
		if (!guilds || !(guilds.length > 0)) return guilds;

		for (let guild of guilds) guild.isManager = checkManager(guilds.permissions_new || guild.permissions)
		guilds = guilds.filter((guild: any) => guild.isManager === true);

		for (let guild of guilds) guild.isInvited = await ServerSchema.findOne({ guildID: guild.id }) || null
		guilds = guilds.sort((a: any, b: any) => a.isInvited === b.isInvited ? 0 : a.isInvited ? -1 : 1);

		// profile.guilds = profile.guilds.sort((a: any, b: any) => {
		// 	if (a.isManager === b.isManager) return 0;
		// 	return a.isManager ? -1 : 1;
		// });

		return guilds
	}
}
