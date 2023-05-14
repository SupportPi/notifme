const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('subscribe')
        .setDescription('quick test')
        .addStringOption((opt) => {
            opt
            .setName('channel_url')
            .setRequired(true)
        })
        .addStringOption((opt) => {
            opt
            .setName('live_url')
            .setRequired(true)
        })
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    redis: True,
        
    async execute(interaction, redisClient) {
        // URL Validation (funtion that resolves to {channelId: sds, handle: sjds} or null);
        // 
        await interaction.reply('');
    }
}