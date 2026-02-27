import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getTrackedUsers } from "./trackuser.js";

export const data = new SlashCommandBuilder()
  .setName("list")
  .setDescription("Show all tracked players in this server");

export async function execute(interaction: ChatInputCommandInteraction) {
  const guildId = interaction.guildId;

  if (!guildId) {
    await interaction.reply("This command only works in servers.");
    return;
  }

  const users = getTrackedUsers(guildId);

  if (users.length === 0) {
    await interaction.reply("No players being tracked. Use /track to add one.");
    return;
  }

  const list = users.map((u, i) => `${i + 1}. ${u.name}#${u.tag}`).join("\n");

  await interaction.reply(`Tracked Players:\n\n${list}`);
}