import express, { Router, Request, Response, NextFunction } from 'express';
import { BooleanSession } from '../interface/Session';
import passport from 'passport';

const router = Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
	if ((req.session as BooleanSession).userId) res.redirect("/dashboard"); else res.redirect("/auth/login")
});

router.get('/login', passport.authenticate('discord'), (req: Request, res: Response) => {
	res.sendStatus(200)
})

router.get('/login/callback', passport.authenticate('discord'), (req: Request, res: Response) => {
	console.log((req.session as BooleanSession).passport)
	res.sendStatus(200)
})

export default router;