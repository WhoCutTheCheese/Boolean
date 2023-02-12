import express, { Router, Request, Response, NextFunction } from 'express';
import * as config from '../config.json'
import { BooleanSession } from '../interface/Session';

const router = Router();

/* GET home page. */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
	let session: BooleanSession = req.session as BooleanSession
	if (!session.passport || !session.passport.user) return res.render('index', config);
	let user = session.passport.user

	res.render('main', { ...config, ...user });
});

export default router;
