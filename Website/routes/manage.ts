import express, { Router, Request, Response, NextFunction } from 'express';
import { BooleanSession } from '../interface/Session';
import * as config from '../config.json'
import ServerSchema from '../schema/ServerSchema';
import fs from 'fs';
import path from 'path';
import { Utilities } from '../utils/Utilities';
import { getCooldown, setCooldown } from '../app';
import WebUsers from '../schema/WebUsers';
import client from '../bot';

const router = Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => res.redirect('/dashboard'));

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
	let session: BooleanSession = req.session as BooleanSession
	if (!session.passport || !session.passport.user) return res.redirect("/")
	let user = session.passport.user

	let dbserver = await ServerSchema.findOne({ guildID: req.params.id })
	let server = await (await client.guilds.fetch(req.params.id)).toJSON()
	let userServer = user.guilds.find(gld => gld.id === req.params.id)

	if (!dbserver || !server) return new Utilities().sendToInvite(req.params.id, req, res)

	if (!getCooldown(user.discordId)) {
		setCooldown(user.discordId);

		let guilds = await new Utilities().updateGuilds(user.guilds);
		if (guilds) {
			(req.session as any).passport.user.guilds = guilds;
			await WebUsers.findOneAndUpdate({ discordId: user.discordId }, { guilds: guilds });
		}
	}

	console.log(userServer)

	res.render('manage/main', { ...{ dbserver }, ...{ server }, ...{ config }, ...{ user }, ...{ userServer }, ...{ showminnavbar: true } })
});

router.get('/:id/:module', async (req: Request, res: Response, next: NextFunction) => {

	let session: BooleanSession = req.session as BooleanSession
	if (!session.passport || !session.passport.user) return res.redirect("/")
	let user = session.passport.user

	let server = await ServerSchema.findOne({ guildID: req.params.id })
	let module = req.params.module.toLowerCase()

	var viewPath = path.join(req.app.get('views'), "/manage", module);

	if (!server) return res.redirect('/dashboard')

	if (fs.existsSync(viewPath)) {
		res.render(module, { ...{ config }, ...{ user }, ...{ server } });
	} else {
		res.render('error', { ...{ config }, ...{ user } })
	}
});

export default router;