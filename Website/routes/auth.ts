import express, { Router, Request, Response, NextFunction } from 'express';
import { BooleanSession } from '../interface/Session';
import passport from 'passport';
import { ReservedOrUserEventNames } from 'socket.io/dist/typed-events';

const router = Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
	let session: BooleanSession = req.session as BooleanSession
	if (session.passport && session.passport.user) res.redirect("/dashboard"); else res.redirect("/auth/login")
});

router.get('/login', passport.authenticate('discord', { failureRedirect: '/' }))

router.get('/logout', (req: Request, res: Response, next: NextFunction) => {
	let session: BooleanSession = req.session as BooleanSession
	if (!session.passport || !session.passport.user) return res.redirect("/auth/login")
	session.passport = undefined
	res.redirect('/');
})

router.get('/login/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req: Request, res: Response) => {
	res.redirect("/dashboard")
})

export default router;