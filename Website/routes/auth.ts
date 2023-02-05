import express, { Router, Request, Response, NextFunction } from 'express';
import { BooleanSession } from '../sessionInterface';

const router = Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
	if ((req.session as BooleanSession).userId) res.redirect("/dashboard"); else res.redirect("/auth/login")
});

router.get('/login', (req: Request, res: Response, next: NextFunction) => {
	if ((req.session as BooleanSession).userId) return res.redirect("/dashboard");

	res.render("login")
});

export default router;
