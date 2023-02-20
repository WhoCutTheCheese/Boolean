import { PermissionsBitField } from "discord.js";

export interface BooleanCommand {
	// commands: Array<string>,
	command: string,
	description: string,
	commandCategory: string,
	aliases?: Array<string>,
	minArgs?: number,
	maxArgs?: number,
	expectedArgs?: string,
	cooldown?: number,
	devOnly?: boolean,
	subCommands?: Array<string>,
	botPermissions?: Array<any>,
	userPermissions?: Array<any>,
	callback: Function,
}
