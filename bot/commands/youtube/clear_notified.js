const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('clears video id blocklist')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    pass_redis: true,
        
    async execute(interaction, redisClient) {
        // Removes a channel from the Subscription Set
        const guild_id = interaction.guild.id;
        const handle = interaction.options.getString('channel_handle');
        console.log()
        try {
            redisClient.del(`${guild_id}-notified`);
        } catch(err) {
            console.error(err);
            return await interaction.reply(`Failed to clear cached Notifications.`)
        }
        await interaction.reply(`Cleared cached Notifications (will attempt to renotify)!`);
    }
}