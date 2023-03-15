import mongoose from 'mongoose'

let Schema = new mongoose.Schema({
	guildID: String,
	guildSettings: {
		prefix: String,
		premium: Boolean,
		premiumHolder: String,
		totalCases: Number,
		joinRoles: Array,
		embedColor: String,
	},
	modSettings: {
		muteRole: String,
		modLogChannel: String,
		dmOnPunish: {
			type: Boolean,
			default: true
		},
		warnsBeforeMute: Number,
		deleteCommandUsage: Boolean
	},
	bans: Object,
	modRoles: Array,
	adminRole: Array,
})

export default mongoose.model('settings', Schema);