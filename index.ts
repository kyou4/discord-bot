import { Client, GatewayIntentBits, Collection, TextChannel } from "discord.js";
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname } from "node:path";
import { riotApi } from "./riotservice.js";
import { pollUserLp } from "./lppolling.js";
import { getAllTrackedUsers } from "./commands/utility/trackuser.js";

export class CustomClient extends Client {
  commands: Collection<string, any>;

  constructor() {
    super({ intents: [GatewayIntentBits.Guilds] });
    this.commands = new Collection();
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));

export const client = new CustomClient();
const token = process.env.TOKEN;

async function loadCommands() {
  const foldersPath = path.join(__dirname, "commands");
  const commandFolders = await fs.readdir(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = (await fs.readdir(commandsPath)).filter(file => file.endsWith(".ts"));
    
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const commandModule = await import(pathToFileURL(filePath).href);
      const command = commandModule;
      
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }
}

async function loadEvents() {
  const eventsPath = path.join(__dirname, "events");
  const eventFiles = (await fs.readdir(eventsPath)).filter(file => file.endsWith(".ts"));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const eventModule = await import(pathToFileURL(filePath).href);
    const event = eventModule.default || eventModule;

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
}


async function pollAllUsers() {
  const trackedUsers = getAllTrackedUsers();


  for (const { user } of trackedUsers) {
    try {
      const channel = await client.channels.fetch(user.channelId) as TextChannel;
      
      if (!channel) {
        console.log(`Channel ${user.channelId} not found`);
        continue;
      }

      const account = { gameName: user.name, tagLine: user.tag, puuid: user.puuid };
      await pollUserLp(account, channel);
      
    } catch (error) {
      console.error(`Error polling ${user.name}#${user.tag}:`, error);
    }
  }
}

function startPolling() {
	pollAllUsers();
	
  const POLL_INTERVAL = 60 * 1000; 

  setInterval(async () => {
    await pollAllUsers();
  }, POLL_INTERVAL);

  console.log("Polling started - checking every 60 seconds");
}

async function main() {
  await loadCommands();
  await loadEvents();
  
  client.once("clientReady", () => {
    console.log(`Logged in as ${client.user?.tag}`);
    startPolling();
  });

  client.login(token);
}

main();