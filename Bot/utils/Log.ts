import 'colors';

/**
 * The severity of a log entry.
 * @enum {number}
 */
export enum LogLevel {
	/** Information severity. */
	Info,
	/** Debugging severity. */
	Debug,
	/** Code warning severity. */
	Warn,
	/** Code error severity. */
	Error,
}

/**
 * Makes a log entry.
 * @param {LogLevel} level The severity of the entry.
 * @param {string} message The message to include.
 */

export const Log = {
	debug(message: string): void {
		logToConsole(LogLevel.Debug, message);
	},

	info(message: string): void {
		logToConsole(LogLevel.Info, message);
	},

	warn(message: string): void {
		logToConsole(LogLevel.Warn, message);
	},

	error(message: string): void {
		logToConsole(LogLevel.Error, message);
	},
};

async function logToConsole(level: LogLevel, message: string) {
	let levelMessage = "";

	switch (level) {
		case (LogLevel.Info): levelMessage = "[INFO]".magenta; break;
		case (LogLevel.Debug): levelMessage = "[DEBUG]".blue; break;
		case (LogLevel.Warn): levelMessage = "[WARNING]".yellow; break;
		case (LogLevel.Error): levelMessage = "[ERROR]".red; break;
	}
	if (levelMessage == undefined || levelMessage == null) {
		levelMessage = ""
	}

	let logMSG = `${await timeStringNow()} ${levelMessage} | ${message}`
	console.log(logMSG)
}

async function timeStringNow(): Promise<string> {
	const now = new Date();
	return `${now.getDate().toString().padStart(2, "0")}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getFullYear().toString().padStart(4, "0")} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}:${now.getMilliseconds().toString().padStart(3, "0")} CST`;
}