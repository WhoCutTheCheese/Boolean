import passport from 'passport';
import Strategy from 'passport-discord';
import WebUsers from '../Schema/WebUsers';

passport.serializeUser((user, done) => {
	done(null, user)
})

passport.deserializeUser(async (id, done) => {
	console.log(id)
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
	callbackURL: 'http://localhost:3000/auth/login/callback',
	scope: ['identify', 'guilds'],
},
	async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
		const discordUser = await WebUsers.findOne({ discordId: profile.id })
		if (discordUser) return done(null, discordUser)

		const newUser = await WebUsers.create({ discordId: profile.id, accessToken, Guilds: profile.guilds })
		return done(null, newUser)
	}
));