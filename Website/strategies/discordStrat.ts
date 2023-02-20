import passport from 'passport';
import Strategy from 'passport-discord';
import WebUsers from '../schema/WebUsers';
import { WebUser } from '../schema/WebUsers';
import * as config from '../config.json'
import ServerSchema from '../schema/ServerSchema';
import { Utilities } from '../utils/Utilities';

passport.serializeUser((user, done) => {
	done(null, user)
})

passport.deserializeUser(async (id, done) => {
	try {
		const user = await WebUsers.findById(id)
		if (!user) return;
		done(null, user)
	} catch (err) {
		console.error(err)
		done(err, null)
	}
})

passport.use(new Strategy({
	clientID: process.env.client_id!,
	clientSecret: process.env.client_secret!,
	callbackURL: config.loginCallback,
	scope: ['identify', 'guilds'],
},
	async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
		if (!profile || !profile.guilds) return done("Failed to get user guilds")

		profile.guilds = await new Utilities().updateGuilds(profile.guilds)

		let newData: WebUser = {
			discordId: profile.id,
			accessToken,
			username: profile.username,
			tag: profile.discriminator,
			avatar: profile.avatar,
			createdAt: profile.createdAt,
			guilds: profile.guilds
		}

		const discordUser = await WebUsers.findOneAndUpdate({ discordId: profile.id }, newData)
		if (discordUser) return done(null, discordUser)

		const newUser = await WebUsers.create(newData)
		return done(null, newUser)
	}
));