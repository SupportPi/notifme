const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('unsub')
        .setDescription('unsubs a youtube channel from notifications')
        .addStringOption((opt) => 
            opt
            .setName('channel_handle')
            .setDescription('a valid youtube handle that resolves to a youtube channel that\'s subscribed to by this guild')
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    pass_redis: true,
        
    async execute(interaction, redisClient) {
        // Removes a channel from the Subscription Set
        const guild_id = interaction.guild.id;
        const handle = interaction.options.getString('channel_handle');
        try {
            await redisClient.sRem(`${guild_id}-subs`, handle);
        } catch(err) {
            console.error(err);
            return await interaction.reply(`Error removing ${handle} from the Guild's Subscription Set`)
        }
        await interaction.reply(`Removed ${handle} from Guild's Subscription Set`);
    }
}