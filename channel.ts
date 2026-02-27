import { TextChannel } from "discord.js";
import { client } from "./index.js";

export async function getChannel(id: string) {
    const channel = await client.channels.fetch(id);
    if (channel && channel.isTextBased()) {
        return channel as TextChannel;
    }
    return null;
}
