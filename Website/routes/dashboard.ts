import express, { Router, Request, Response, NextFunction } from 'express';
import { BooleanSession } from '../interface/Session';
import * as config from '../config.json'
import { getCooldown, setCooldown } from '../app';
import { Utilities } from '../utils/Utilities';
import WebUsers from '../schema/WebUsers';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
	let session: BooleanSession = req.session as BooleanSession
	if (!session.passport || !session.passport.user) return res.redirect("/")
	let user = session.passport.user;

	let guilds: any = user.guilds

	if (!getCooldown(user.discordId)) {
		setCooldown(user.discordId);

		guilds = await new Utilities().updateGuilds(guilds);
		if (guilds) {
			(req.session as any).passport.user.guilds = guilds;
			await WebUsers.findOneAndUpdate({ discordId: user.discordId }, { guilds: guilds });
		}
	}

	res.render('dashboard', { ...config, ...user })
});

export default router;