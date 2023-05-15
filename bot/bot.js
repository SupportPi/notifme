const fs = require('node:fs');
const path = require('node:path');

const redis = require('redis');
const colors = require('colors');
const cron = require('node-cron');
const dotenv = require('dotenv');
dotenv.config();

async function run(){
// creates a redis client w/ node-redis package and connects to redis store
const redisClient = redis.createClient({ url: `redis://redis:6379`});
redisClient.on("error", (err) => {
    console.log(`${err}`.red)
});
redisClient.on("connect", (err) => {
    console.log("Connected to Redis!".green)
})
await redisClient.connect();




const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder} = require('discord.js');
const { channel } = require('node:diagnostics_channel');
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
        try {
            console.error(error);
            if(interaction.replied || interaction.deferred) {
                await interaction.followUp({content: 'There was an error while executing this command', ephemeral: true});
            }
            await interaction.reply({content: 'There was an error while executing this command', ephemeral: true});
        } catch(err){
            console.log("Interaction Double Error - Did you send an Error reply in a command?")
        }
    }

    //console.log(interaction);
});
// non API Method stolen from stack overflow :O 
const { parse } = require('node-html-parser');
async function fetchLiveStatus(handle){
    const channelID = await redisClient.get(handle);
    if(channelID){
        const response = await fetch(`https://youtube.com/channel/${channelID}/live`)
        const text = await response.text()
        const html = parse(text)
        const canonicalURLTag = html.querySelector('link[rel=canonical]')
        const canonicalURL = canonicalURLTag.getAttribute('href')
        const isStreaming = canonicalURL.includes('/watch?v=')
        if(isStreaming){
            return {
                streaming: true,
                videoId: canonicalURL.split(`/watch?v=`)[1]
            }
        } else {
            return {
                streaming: false,
                videoId: null
            }
        }

    } else {
        return {
            streaming: false,
            videoId: null
        }
    }

}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function getUnixTimestamp() {
    return Math.floor(Date.now() / 1000);
}
function truncate(str, n){
    return (str.length > n) ? str.slice(0, n-1) + '…' : str;
};


// runs every five minutes
cron.schedule('*/1 * * * *', async () => {
    try {
        const channelStatus = {};
        let guilds = await redisClient.sMembers(`running`);
        if(!guilds) return;
        // Runs through Guilds to perform notification nonsense on.
        let handles = [];
        for(const guild_id of guilds) {
            const subs = await redisClient.sMembers(`${guild_id}-subs`);
            if(subs) handles = handles.concat(subs) 
        }
        // filters out all duplicates
        let uniqueHandles = [...new Set(handles)];
        // runs through handles to check for live notifications
        console.log(uniqueHandles)

        // .... probably won't break
        for(const handle of uniqueHandles) {
            console.log(handle);
            channelStatus[handle] = await fetchLiveStatus(handle);
        }

        for(const guild_id of guilds) {
            const API_KEY = await redisClient.get(`${guild_id}-YTV3`)
            const default_channel_id = await redisClient.get(`${guild_id}-default_channel`);
    
            let default_channel;
            if(default_channel_id) {
                default_channel =  client.channels.cache.get(default_channel_id);
            } else {
                console.log("Skipping Guild!")
                // skips a guild if no default channel is set - change later
                continue;
            }
            const subs = await redisClient.sMembers(`${guild_id}-subs`);
            for(const sub of subs) {
                
                if(channelStatus[sub].streaming) {
                    if(await redisClient.sIsMember(`${guild_id}-notified`, channelStatus[sub].videoId)) continue;

                    try {

                        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${channelStatus[sub].videoId}&key=${API_KEY}&part=snippet,statistics,contentDetails&fields=items(snippet(description,liveBroadcastContent,thumbnails/high/url,channelTitle,defaultAudioLanguage,title),statistics(viewCount), contentDetails/contentRating)`);
                        const parsed = await response.json();
                        console.log(parsed)
                        const thumbnail_url = parsed.items[0].snippet?.thumbnails?.high?.url;
                        const live_status =  parsed.items[0].snippet.liveBroadcastContent;
                        const channelTitle = parsed.items[0].snippet.channelTitle;
                        const videoViews = parsed.items[0].statistics.viewCount; // Always 0, this is stupid
                        const defaultLanguage = parsed.items[0].snippet.defaultAudioLanguage || "en"; // has to be set...
                        const videoTitle = parsed.items[0].snippet.title;
                        const matureContent = !!parsed.items[0].contentDetails.contentRating?.ytRating;
                        let description =  parsed.items[0].snippet.description;
                        description = "\n" + description.replace(/(\r\n|\n|\r)/gm, " "); // replaces all newlines with spaces

                        //console.log(thumbnail_url, live_status, channelTitle, videoViews, defaultLanguage, videoTitle, matureContent, description)
                        if(live_status === 'live'){
                            let live_message = await redisClient.get(`${guild_id}-${sub}-live_message`);
                            if(!live_message) live_message = `${sub} is live!`;

                            const embed = new EmbedBuilder()
                            .setColor(0x0013de)
                            .setAuthor({ name: channelTitle })
                            .setTitle("**" + videoTitle + "**")
                            .setURL(`https://www.youtube.com/watch?v=${channelStatus[sub].videoId}`)
                            .addFields(
                                { name: `\`\`\`🔴 Live \`\`\` <t:${getUnixTimestamp()}:R>`,
                                  value: capitalize(truncate(description, 75)) },
                            )
                            //.setDescription(truncate(description, 40)) // Removes newlines
                            .addFields(
                                { name: 'Language', value: capitalize(defaultLanguage), inline: true },
                                { name: 'Views', value: videoViews.toString(), inline: true },
                                { name: 'Mature Content', value: capitalize(matureContent.toString()), inline: true },
                            )
                            //.setThumbnail('https://i.imgur.com/g328w9R.png') //flavr logo
                            .setTimestamp()
                            .setFooter({ text: 'FlavrLive', /* url: `https://www.youtube.com/watch?v=${channelStatus[sub].videoId}`*/});

                            if(thumbnail_url) embed.setImage(thumbnail_url);
                            const channel_id = await redisClient.get(`${guild_id}-${sub}-notif_channel`);
                            if(channel_id) {
                                const custom_channel = client.channels.cache.get(channel_id);
                                custom_channel.send({content: live_message, embeds: [embed]});
                                // add videoId to blacklist after testing.
                            } else {
                                default_channel.send({content: live_message, embeds: [embed]});
                            }     

                            redisClient.sAdd(`${guild_id}-notified`, channelStatus[sub].videoId);
                        } else { 
                            console.log("False Live Positive.".yellow);
                        }
                    } catch (err){
                        console.log(err)
                        continue;
                    }
                }






            }
        }


    } catch(err) {
        console.log(err.red);
    }
    
});



// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`.green);
});

// Log in to Discord with your client's token
client.login(token);

}
run();