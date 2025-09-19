// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits, Collection, MessageFlags } from "discord.js"
import "dotenv/config";
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname } from 'node:path';
// Default client doesn't have a property "command" so I need to extend it
class CustomClient extends Client {
  commands: Collection<string, any>;

  constructor() {
    super({ intents: [GatewayIntentBits.Guilds] });
    this.commands = new Collection();
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create a new client instance
const client = new CustomClient();
const token = process.env.TOKEN

async function loadCommands(){
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = await fs.readdir(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = (await fs.readdir(commandsPath)).filter(file => file.endsWith('.ts'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);

		// Convert Windows path to file:// URL	
		const commandModule = await import(pathToFileURL(filePath).href);
		const command = commandModule.default || commandModule;
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
  }
}
await loadCommands();

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});