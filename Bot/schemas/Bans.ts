import mongoose from 'mongoose'

export interface BansInterface {
	guildID: String,
	userID: String,
	caseNumber: String,
	banExpireUnix: Number,
}

let Schema = new mongoose.Schema({
	guildID: String,
	userID: String,
	caseNumber: String,
	banExpireUnix: Number,
})

export default mongoose.model('bans', Schema);