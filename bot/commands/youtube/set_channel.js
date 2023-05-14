/*const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('subscribe')
        .setDescription('subscribes to a channel for notifications')
        .addStringOption((opt) => 
            opt
            .setName('channel_handle')
            .setDescription('a valid handle that resolves to a youtube channel')
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
        
    async execute(interaction, redis) {
        // URL Validation (funtion that resolves to {channelId: sds, handle: sjds} or null);
        const channel_url = interaction.options.getString('channel_url');
        const live_message = interaction.options.getString('live_message');

        // url to id
        const {channelId, handle} = require('.../helper/url_to_id.js')(channel_url, 'youtube');
        console.log(channelId, handle);
        console.log(channel_url, live_message)

        await interaction.reply('it didn\'t explode (surprisingly)');
    }
}*/