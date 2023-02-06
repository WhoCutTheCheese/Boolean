import mongoose from 'mongoose'
import { Guild } from 'discord.js';

export interface WebUser {
	discordId: string,
	accessToken: string,
	Guilds: Array<Guild>,
	createdAt: Date
}

let Schema = new mongoose.Schema({
	discordId: {
		type: String,
		required: true
	},
	accessToken: {
		type: String,
		required: true
	},
	Guilds: {
		type: Array,
		required: true
	},
	createdAt: {
		type: Date,
		required: true,
		default: new Date()
	}
})

export default mongoose.model('WebUsers', Schema);