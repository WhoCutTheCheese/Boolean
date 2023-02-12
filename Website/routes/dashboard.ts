import express, { Router, Request, Response, NextFunction } from 'express';
import { BooleanSession } from '../interface/Session';
import * as config from '../config.json'

const router = Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
	let session: BooleanSession = req.session as BooleanSession
	if (!session.passport || !session.passport.user) return res.redirect("/")
	let user = session.passport.user

	res.render('dashboard', { ...config, ...user })
});

export default router;