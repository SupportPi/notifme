const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('link_youtube_api_key')
        .setDescription('links an api key with access to the youtube v3 api to a Guild')
        .addStringOption((opt)=>
            opt.setName("api_key")
               .setDescription("api key to link"))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    pass_redis: true,
        
    async execute(interaction, redisClient) {
        const testing = false;
        // Opens a Modal to Configure some API Stuff 
        const guild_id = interaction.guild.id;
        const key = interaction.options.getString('api_key')
        // Test's the key
        let valid = false;
        try {
            let res = await fetch(`https://www.googleapis.com/youtube/v3/channels?key=${key}&id=UCw5TwP50169MsgbGTJQ1dIg`);
            let parsed = await res.json();
            if(parsed.items[0].id) valid = true;
        } catch(err) {
            //return await interaction.reply({content: "Error! Invalid API Key", ephemeral: !testing});
        }
        if(valid){
            redisClient.set(`${guild_id}-YTV3`, key)
            return await interaction.reply({content: "API Key is valid and has been linked to your Guild.", ephemeral: !testing})
        } else {
            await interaction.reply({content: "API Key is Invalid, please check your Google Cloud console and try again later", ephemeral: !testing});
        }
    }
}