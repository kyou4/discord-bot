import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type { CurrentUser } from "../../types.js";
import { riotApi } from "../../riotservice.js";

// Guild ID → User Key → User Data
const trackedUsers: Map<string, Map<string, CurrentUser>> = new Map();

export function addTrackedUser(
  guildId: string, 
  channelId: string, 
  name: string, 
  tag: string,
  puuid: string
): void {
  if (!trackedUsers.has(guildId)) {
    trackedUsers.set(guildId, new Map());
  }
  
  const key = `${name}#${tag}`.toLowerCase();
  trackedUsers.get(guildId)!.set(key, { 
    name, 
    tag, 
    puuid,
    channelId,
    inGame: false,
    
  });
}

export function getTrackedUsers(guildId: string): CurrentUser[] {
  return Array.from(trackedUsers.get(guildId)?.values() ?? []);
}

export function getAllTrackedUsers(): { guildId: string; user: CurrentUser }[] {
  const all: { guildId: string; user: CurrentUser }[] = [];
  
  for (const [guildId, users] of trackedUsers) {
    for (const user of users.values()) {
      all.push({ guildId, user });
    }
  }
  
  return all;
}

export function isTracked(guildId: string, name: string, tag: string): boolean {
  const key = `${name}#${tag}`.toLowerCase();
  return trackedUsers.get(guildId)?.has(key) ?? false;
}

export function removeTrackedUser(guildId: string, name: string, tag: string): boolean {
  const key = `${name}#${tag}`.toLowerCase();
  return trackedUsers.get(guildId)?.delete(key) ?? false;
}

export const data = new SlashCommandBuilder()
  .setName("track")
  .setDescription("Track a League of Legends player")
  .addStringOption(option =>
    option
      .setName("username")
      .setDescription("League IGN (e.g., DoubleLift#NA1)")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const username = interaction.options.getString("username");
  const guildId = interaction.guildId;
  const channelId = interaction.channelId;

  if (!guildId) {
    await interaction.reply("This command only works in servers.");
    return;
  }

  if (!username) {
    await interaction.reply("Please provide a valid username.");
    return;
  }

  const [name, tag] = username.split("#");

  if (!name || !tag) {
    await interaction.reply("Invalid format. Use: GameName#TagLine (e.g., DoubleLift#NA1)");
    return;
  }

  if (isTracked(guildId, name, tag)) {
    await interaction.reply(`${name}#${tag} is already being tracked.`);
    return;
  }

  await interaction.deferReply();

  const account = await riotApi.getAccount(name, tag);

  if (!account) {
    await interaction.editReply(`Could not find ${name}#${tag} on Riot API.`);
    return;
  }

  addTrackedUser(guildId, channelId, name, tag, account.puuid);
  
  await interaction.editReply(`Now tracking ${name}#${tag} in this channel.`);
}