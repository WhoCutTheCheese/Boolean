import { Schema, model } from "mongoose"

let schema = new Schema({
	guildID: String,
	userID: String,
	modID: String,
	caseID: Number,
	action: String,
	caseDetails: {
		reason: String,
		date: String,
		length: String,
	}
})

export default model('cases', schema)