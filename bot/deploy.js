const colors = require("colors");
const dotenv = require('dotenv');
dotenv.config();

const { REST, Routes } = require('discord.js');
const { CLIENT_ID, DISCORD_TOKEN } = process.env;

const fs = require('node:fs');
const path = require('node:path');

const commands = [];

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`.yellow);
		}
    }
}



// Construct and prepare an instance of the REST module
const rest = new REST().setToken(DISCORD_TOKEN);

// deploys the commands
(async () => {
    try {
        console.log(`started refreshing ${commands.length} application (/) commands.`.yellow);
        const data = await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            {body: commands},
        );
        console.log(`Successfully reloaded ${data.length} application (/) commands`.green);
    } catch (error) {
        console.error(`${error}`.red);
    }
})();