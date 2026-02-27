import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { removeTrackedUser } from "./trackuser.js";

export const data = new SlashCommandBuilder()
  .setName("untrack")
  .setDescription("Stop tracking a League player")
  .addStringOption(option =>
    option
      .setName("username")
      .setDescription("League IGN (e.g., DoubleLift#NA1)")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const username = interaction.options.getString("username");
  const guildId = interaction.guildId;

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
    await interaction.reply("Invalid format. Use: GameName#TagLine");
    return;
  }

  if (removeTrackedUser(guildId, name, tag)) {
    await interaction.reply(`Stopped tracking ${name}#${tag}.`);
  } else {
    await interaction.reply(`${name}#${tag} was not being tracked.`);
  }
}