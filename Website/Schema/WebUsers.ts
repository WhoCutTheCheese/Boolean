import mongoose from 'mongoose'
import { Guild } from 'discord.js';

export interface WebUser {
	discordId: string,
	accessToken: string,
	username: string,
	tag: string,
	avatar: string,
	guilds: Array<Guild>,
	createdAt: Date
}

let Schema = new mongoose.Schema({
	discordId: String,
	username: String,
	tag: String,
	avatar: String,
	accessToken: String,
	guilds: Array,
	createdAt: {
		type: Date,
		default: new Date()
	}
})

export default mongoose.model('WebUsers', Schema);