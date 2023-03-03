import { Main } from "..";
import Bans from "../schemas/Bans";
import { Log } from "../utils/Log";

export async function checkBans() {
	let bans = await Bans.find({});

	if (bans.length <= 0) return;

	for (let ban of bans) {
		if (!(ban.banExpireUnix! < Date.now())) return;

		let client = new Main().getClient();
		let user = await client.users.fetch(ban.userID!).catch(() => { });
		if (!user) return;

		let guild = await client.guilds.fetch(ban.guildID!).catch(() => { });
		if (!guild) return;

		guild.members.unban(user, "Ban expired");
		await ban.delete();
	}
}

setInterval(checkBans, 10 * 1000); 