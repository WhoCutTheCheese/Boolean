import express, { Router, Request, Response, NextFunction } from 'express';
import * as settings from '../config.json'

const router = Router();

/* GET home page. */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
	res.render('index', settings);
});

export default router;