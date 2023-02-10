import express, { Router, Request, Response, NextFunction } from 'express';
import { BooleanSession } from '../interface/Session';
import * as config from '../config.json'

const router = Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => res.redirect('/dashboard'));

router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
	console.log(req.params.id)
	res.redirect('/dashboard')
});

export default router;