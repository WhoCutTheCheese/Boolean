import passport from 'passport';
import Strategy from 'passport-discord';
import WebUsers from '../Schema/WebUsers';
import { WebUser } from '../Schema/WebUsers';

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
	callbackURL: 'http://localhost:3000/auth/login/callback',
	scope: ['identify', 'guilds'],
},
	async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
		for (let guild of profile.guilds) {
			guild.isManager = checkManager(guild.permissions_new)
		}

		profile.guilds = profile.guilds.sort((a: any, b: any) => {
			if (a.isManager === b.isManager) return 0;
			return a.isManager ? -1 : 1;
		});

		let newData: WebUser = {
			discordId: profile.id,
			accessToken,
			username: profile.username,
			tag: profile.discriminator,
			avatar: profile.avatar,
			createdAt: profile.createdAt,
			Guilds: profile.guilds
		}

		const discordUser = await WebUsers.findOneAndUpdate({ discordId: profile.id }, newData)
		if (discordUser) return done(null, discordUser)

		const newUser = await WebUsers.create(newData)
		return done(null, newUser)
	}
));

function checkManager(permissions: string): boolean {
	const manageServerFlag = 0x00000020;
	const permissionsInt = parseInt(permissions);

	if ((permissionsInt & manageServerFlag) !== 0) {
		return true;
	} else {
		return false;
	}
}