const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    alt_handle: async (handle) => {
        console.log('getting handle')
        const search_str = `<meta itemprop="channelId" content="`;
        const search_str_len = search_str.length;
        console.log(`https://www.youtube.com/@${
            handle.substring(0, 1) === '@' ? handle.substring(1) : handle
        }`)
        const page = await (await fetch(`https://www.youtube.com/@${
            handle.substring(0, 1) === '@' ? handle.substring(1) : handle
        }`)).text();
        //console.log(page);
        const index = page.indexOf(`<meta itemprop="channelId"`);
        if(index ===-1) return null;
        const closin = page.substring(index, page.indexOf(`"`, index + search_str_len)+2);
        console.log(closin)
        return closin.substring(closin.indexOf(search_str) +  search_str_len , closin.length - 2)
    },

    handle_to_id: async (handle) => {
            const result = null;
            const handle_2 = handle.replace("@", ""); // cleans handle of @
            try {
                const req = `https://yt.lemnoslife.com/channels?handle=@${handle_2}`;
                const fetched = await fetch(req);
                const parsed = await fetched.json();
                return parsed.items[0].id;
            } catch (err) {
                console.log("error encountered")
                console.log(err);
                resolve(result);
            }
    },
    data: new SlashCommandBuilder()
        .setName('sub')
        .setDescription('subscribes to a channel for notifications')
        .addStringOption((opt) => 
            opt
            .setName('channel_handle')
            .setDescription('a valid youtube handle that resolves to a youtube channel')
            .setRequired(true)
        )
        .addStringOption((opt) => 
            opt
            .setName('live_message')
            .setDescription('the message to display when the channel goes live.')
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    pass_redis: true,
        
    async execute(interaction, redisClient) {
        
        const guild_id = interaction.guild.id;
        // gets the options from the slash command
        const channel_handle = interaction.options.getString('channel_handle');
        const live_message = interaction.options.getString('live_message');




        // Converts the Handle into a channelId and attempts to store it + the live_message in the redis store
        
        //const handle_id = await this.handle_to_id(channel_handle);
        const handle = channel_handle;
        const channelId = await this.handle_to_id(channel_handle)

        console.log(channelId, handle);
        try {
            if(channelId && handle){
                await redisClient.set(channel_handle, channelId);
                await redisClient.set(`${guild_id}-${channel_handle}-live_message`, live_message);
            }
            else {
                throw new Error("Failed to retrieve the ChannelId");
            }   
        } catch (err){ 
            console.error(err);
            return await interaction.reply('failed to add channel... check logs')
        }


        // Creates/Adds a Handle to a "Subs" set.
        try {
            await redisClient.sAdd(`${guild_id}-subs`, handle);
        } catch(err) {
            console.error(err);
            return await interaction.reply('failed to add channel... check logs')
        }
            
        

        await interaction.reply('it didn\'t explode (surprisingly)\n' + channelId);
    }
}