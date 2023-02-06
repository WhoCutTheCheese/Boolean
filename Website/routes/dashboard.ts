import express, { Router, Request, Response, NextFunction } from 'express';
import { BooleanSession } from '../interface/Session';
import * as config from '../config.json'

const router = Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
	let session: BooleanSession = req.session as BooleanSession
	if (!session.passport || !session.passport.user) return res.redirect("/auth/login")

	res.render('dashboard', { servers: { name: "test", icon: "https://cdn.discordapp.com/icons/1071223504852238406/71087442d87b059a89c4839fed13e322.webp" } })
});

export default router;