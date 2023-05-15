const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_default_notif_channel')
        .setDescription('set\'s the default channel for notifications')
        .addChannelOption((opt)=>
            opt.setName("channel")
               .setDescription("channel to set as the default for notifications")
               .setRequired(true)
        )
               
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    pass_redis: true,
        
    async execute(interaction, redisClient) {
        // TODO - Fix this mess later, add error handling and all that (it is 3:00am) c:
        const default_channel = await interaction.options.getChannel("channel");
        const guild_id = interaction.guild.id;
        redisClient.set(`${guild_id}-default_channel`, default_channel.id);
        await interaction.reply({content: `my default channel for sending notifications is now <#${default_channel}>`})
    }   
}