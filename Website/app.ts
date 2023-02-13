// * Imports * \\

import * as dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import debug from 'debug';
import http from 'http';
import path from 'path';
import logger from 'morgan';
import session, { Session } from 'express-session'
import mongoStore from 'connect-mongo'
import mongoose from 'mongoose'
import sharedsession from 'express-socket.io-session';
import axios from 'axios';
import * as config from './config.json'
import Socket from "socket.io";

// * ENV Validator * \\

var mongoURL = process.env.mongo_url;
if (!mongoURL) throw new Error("Please put a mongo url (mongo_url) in your ENV, it is required for this website to work!")
if (!process.env.client_id) throw new Error("Please put a discord oauth2 client id (client_id) in your ENV, it is required for this website to work!")
if (!process.env.client_secret) throw new Error("Please put a discord oauth2 bot secret (client_secret) in your ENV, it is required for this website to work!")

// * Custom imports * \\

import './strategies/discordStrat'

import indexRouter from './routes/index';
import authRouter from './routes/auth';
import dashRouter from './routes/dashboard';
import manageRouter from './routes/manage';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { BooleanSession } from './interface/Session';
import WebUsers from './schema/WebUsers';
import ServerSchema from './schema/ServerSchema';
import { Utilities } from './utils/Utilities';

// * Important setup * \\

const app = express();
const server = http.createServer(app);
const io = new Socket.Server(server);

const port = normalizePort(process.env.PORT || '3000');

// * Mongo * \\

mongoose.set('strictQuery', true);
mongoose.connect(mongoURL);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// * App setup * \\

app.set('port', port);

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
app.use('/manage', manageRouter)

// * App errors * \\

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
	next(createError(404));
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	// set locals, only providing error in development
	console.error(err)
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error', config);
});

// * Sockets * \\

let cooldownMap = new Map<string, number>();

export function setCooldown(userId: string) {
	let currentTime = Math.floor(Date.now() / 1000);
	cooldownMap.set(userId, currentTime + 90);
}

export function getCooldown(userId: string): boolean {
	if (!cooldownMap.get(userId)) return false;

	let endTime = cooldownMap.get(userId);
	if (typeof endTime === 'undefined') return false;

	let currentTime = Math.floor(Date.now() / 1000);
	if (currentTime >= endTime) {
		cooldownMap.delete(userId);
		return false;
	} else {
		console.log(`User on cooldown: ${endTime - currentTime} more seconds`)
		return true;
	}
}

function getSessionUser(socket: Socket.Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
	let handshake = socket.handshake as any
	let session: BooleanSession = handshake.session as BooleanSession
	if (!session.passport || !session.passport.user) return null;
	let user = session.passport.user

	return user || null;
}

io.use(sharedsession(appSession));

io.on("connection", (socket) => {
	app.set("socket", socket);

	// {page}-{subtype}-{action}-{callback?}

	socket.on("dashboard-servers-update", async () => {
		let user = getSessionUser(socket)

		if (!user) return;
		if (getCooldown(user.discordId)) return;
		setCooldown(user.discordId)

		const accessToken = getSessionUser(socket)!.accessToken;

		try {
			const response = await axios.get('https://discord.com/api/v10/users/@me/guilds', {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});

			console.log("Socket:")
			let guilds = await new Utilities().updateGuilds(response.data);

			(socket.handshake as any).session.passport.user.guilds = guilds;
			(socket.handshake as any).session.save();
			await WebUsers.findOneAndUpdate({ discordId: user.discordId }, { guilds: guilds });
		} catch (error) {
			console.error(error)
		}
	});
});

// * Http handler * \\

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val: string | number): number | string | false {
	const port = parseInt(val as string, 10);

	if (isNaN(port)) return val;

	if (port >= 0) return port;

	return false;
}

function onError(error: NodeJS.ErrnoException): void {
	if (error.syscall !== 'listen') {
		throw error;
	}

	const bind = typeof port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
}

function onListening(): void {
	const addr = server.address();
	const bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr?.port;
	console.log(`Listning on port ${port}`)
}