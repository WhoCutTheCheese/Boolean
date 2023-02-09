import mongoose from "mongoose";

let Schema = new mongoose.Schema({
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

export default mongoose.model('cases', Schema)