import mongoose from "mongoose";

let Schema = new mongoose.Schema({
	guildID: String,
	userID: String,
	modID: String,
	caseID: Number,
	action: String,
	caseDetails: {
		reason: String,
		endDate: Number,
		date: String,
	}
})

export default mongoose.model('cases', Schema)