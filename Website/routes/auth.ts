import express, { Router, Request, Response, NextFunction } from 'express';
import { BooleanSession } from '../interface/Session';
import passport from 'passport';

const router = Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
	let session: BooleanSession = req.session as BooleanSession
	if (session.passport && session.passport.user) res.redirect("/dashboard"); else res.redirect("/auth/login")
});

router.get('/login', passport.authenticate('discord'))

router.get('/login/callback', passport.authenticate('discord'), (req: Request, res: Response) => {
	res.redirect("/dashboard")
})

export default router;