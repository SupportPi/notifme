const fs = require('node:fs');
const path = require('node:path');

const redis = require('redis');
const colors = require('colors');
const cron = require('node-cron');
const dotenv = require('dotenv');
dotenv.config();


// creates a redis client w/ node-redis package and connects to redis store
const redisClient = redis.createClient({ url: `redis://redis:6379`});
redisClient.on("error", (err) => {
    console.log(`${err}`.red)
});
redisClient.on("connect", (err) => {
    console.log("Connected to Redis!".green)
})
redisClient.connect();




const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const token = process.env.DISCORD_TOKEN;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });


client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file=>file.endsWith('.js'));
    // reads in commands from subdirectories and registers them as commands
    for(const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a require "data" or "execute" property.`.yellow);
        }
    }

}




// Receiving Command Interactions
client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if(!command) {
        console.error(`No command matching ${interaction.commandName} was found.`.red);
        return;
    }

    try {
        // If pass_redis is truthy, passes down the redis_client as an argument.
        if(command?.pass_redis){
            await command.execute(interaction, redisClient);
        }
        else {
            await command.execute(interaction);
        }
    } catch(error) {
        console.error(error);
        if(interaction.replied || interaction.deferred) {
            await interaction.followUp({content: 'There was an error while executing this command', ephemeral: true});
        }
        await interaction.reply({content: 'There was an error while executing this command', ephemeral: true});
    }

    //console.log(interaction);
});






// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`.green);
});

// Log in to Discord with your client's token
client.login(token);

