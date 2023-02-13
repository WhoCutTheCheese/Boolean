import express, { Router, Request, Response, NextFunction } from 'express';
import { BooleanSession } from '../interface/Session';
import * as config from '../config.json'
import ServerSchema from '../schema/ServerSchema';
import fs from 'fs';
import path from 'path';
import { Utilities } from '../utils/Utilities';

const router = Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => res.redirect('/dashboard'));

router.get('/:id/:module', async (req: Request, res: Response, next: NextFunction) => {

	let session: BooleanSession = req.session as BooleanSession
	if (!session.passport || !session.passport.user) return res.redirect("/")
	let user = session.passport.user

	let server = await ServerSchema.findOne({ guildID: req.params.id })
	let module = req.params.module.toLowerCase()

	var viewPath = path.join(req.app.get('views'), "/manage", module);

	if (!server) return res.redirect('/dashboard')

	if (fs.existsSync(viewPath)) {
		res.render(module);
	} else {
		res.render('error', { ...config, ...user })
	}
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
	let session: BooleanSession = req.session as BooleanSession
	if (!session.passport || !session.passport.user) return res.redirect("/")
	let user = session.passport.user

	let server = await ServerSchema.findOne({ guildID: req.params.id })

	if (!server) return new Utilities().sendToInvite(req.params.id, req, res)

	res.render('manage/main', { ...config, ...user, ...server, ...{ showminnavbar: true } })
});

export default router;