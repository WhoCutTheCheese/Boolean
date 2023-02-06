import express, { Router, Request, Response, NextFunction } from 'express';
import * as config from '../config.json'

const router = Router();

/* GET home page. */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
	res.render('index', config);
});

export default router;