import { REST, Routes } from 'discord.js'
import "dotenv/config"
import fs from "fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname } from 'node:path';

const token = process.env.TOKEN;
const clientId = process.env.CLIENTID
const guildId = process.env.GUILDID
if (!token) throw new Error('TOKEN environment variable is required');

if (!clientId) throw new Error('ClientId environment variable is required');

if (!guildId) throw new Error('guildId environment variable is required');


const __dirname = dirname(fileURLToPath(import.meta.url));
const commands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = await fs.readdir(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = (await fs.readdir(commandsPath)).filter(file => file.endsWith('.ts'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const commandModule = await import(pathToFileURL(filePath).href);
		const command = commandModule.default || commandModule;
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		) as any;

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();