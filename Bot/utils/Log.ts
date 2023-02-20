import "colors";
//const { magenta, blue, red, yellow } = pkg;
import { Utilities } from "./Utilities";

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
export async function Log(level: LogLevel, message: string): Promise<void> {

    let levelMessage = "";

    switch (level) {
        case (LogLevel.Info): levelMessage = "[INFO]".magenta; break;
        case (LogLevel.Debug): levelMessage = "[DEBUG]".blue; break;
        case (LogLevel.Warn): levelMessage = "[WARNING]".yellow; break;
        case (LogLevel.Debug): levelMessage = "[ERROR]".red; break;
    }
    if (levelMessage == undefined || levelMessage == null) {
        levelMessage = "Peinisi"
    }

    let awd = `${await timeStringNow()} ${levelMessage} | ${message}`
    console.log(awd)

}
async function timeStringNow(): Promise<string> {
    const now = new Date();
    return `${now.getUTCDate().toString().padStart(2, "0")}-${(now.getUTCMonth() + 1).toString().padStart(2, "0")}-${now.getUTCFullYear().toString().padStart(4, "0")} ${now.getUTCHours().toString().padStart(2, "0")}:${now.getUTCMinutes().toString().padStart(2, "0")}:${now.getUTCSeconds().toString().padStart(2, "0")}:${now.getUTCMilliseconds().toString().padStart(3, "0")}`;
}