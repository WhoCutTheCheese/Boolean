import * as dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import path from 'path';
import logger from 'morgan';
import session from 'express-session'
import mongoStore from 'connect-mongo'
import mongoose from 'mongoose'
import * as config from './config.json'

var mongoURL = process.env.mongo_url;
if (!mongoURL) throw new Error("Please put a mongo url in ur ENV, it is required for this website to work!")
if (!process.env.client_id) throw new Error("Please put a discord oauth2 bot id in ur ENV, it is required for this website to work!")
if (!process.env.client_secret) throw new Error("Please put a discord oauth2 bot secret in ur ENV, it is required for this website to work!")

import './strategies/discordStrat'

import indexRouter from './routes/index';
import authRouter from './routes/auth';
import dashRouter from './routes/dashboard';

const app = express();


const appSession = session({
	secret: "5SuperSecretPassword5",
	cookie: {
		maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
	},
	resave: true,
	saveUninitialized: true,
	store: mongoStore.create({
		mongoUrl: mongoURL,
		collectionName: "Sessions",
		ttl: 14 * 24 * 60 * 60, // = 14 days. Default
	}),
});

mongoose.set('strictQuery', true);
mongoose.connect(mongoURL);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
// view engine setup

app.use(appSession);

app.use(logger("dev"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use("/public", express.static(__dirname + "/public"));
app.use("/favicon.ico", express.static(path.join(__dirname, "/public/img/favicon.ico")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/dashboard', dashRouter);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
	next(createError(404));
});

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	// set locals, only providing error in development
	console.error(err)
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error', config);
});

export default app;