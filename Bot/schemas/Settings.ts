import mongoose from 'mongoose'

let Schema = new mongoose.Schema({
	guildID: String,
	guildSettings: {
		prefix: {
			type: String,
			default: "!!"
		},
		premium: Boolean,
		premiumHolder: String,
		totalCases: Number,
		joinRole: String,
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
	modRole: Array,
	adminRole: Array,
})

export default mongoose.model('settings', Schema);