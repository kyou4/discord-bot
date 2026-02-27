// import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
// import fs from "fs/promises"
// import path from "path";
// import { fileURLToPath } from 'node:url';
// import { dirname } from "node:path";
// export const data = new SlashCommandBuilder()
//         .setName("image")
//         .addSubcommand(subcommand=>
//             subcommand
//                 .setName("nivy")
//                 .setDescription("Give random nivy image from my data")
//         )


// export async function execute(interaction:ChatInputCommandInteraction){

//     const __dirname = dirname(fileURLToPath(import.meta.url));

//     if(interaction.options.getSubcommand() === "nivy"){
//         const folderPath = path.join(__dirname, "../../images")
//         const images = await fs.readdir(folderPath)
        
//         const randomImage = images[Math.floor(Math.random() * images.length)];
//         if(!randomImage) return await interaction.reply("NO IMAGE AVAILABLE")
//         const filePath = path.join(folderPath, images[0]!);

//     await interaction.reply({files: [filePath]});
//     return;
//     }
// }

