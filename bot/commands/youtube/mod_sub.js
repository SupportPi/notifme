const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('modsub')
        .setDescription('modifies a subscription')
        .addStringOption((opt) => 
            opt
            .setName('channel_handle')
            .setDescription('a valid youtube handle that resolves to a youtube channel')
            .setRequired(true)
        )
        .addStringOption((opt)=>
        opt.setName("live_message")
           .setDescription('the message to display when the channel goes live.')
           .setRequired(false)
        )
        .addChannelOption((opt)=>
         opt.setName("notif_channel")
            .setDescription('channel to send notifications in')
            .setRequired(false)
         )

        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    pass_redis: true,
        
    async execute(interaction, redisClient) {
        // Removes a channel from the Subscription Set
        const guild_id = interaction.guild.id;
        const channel_handle = interaction.options.getString('channel_handle');
        const live_message = interaction.options.getString('live_message');
        const notif_channel = interaction.options.getChannel('notif_channel');


        try {
            const isMem = await redisClient.sIsMember(`${guild_id}-subs`, channel_handle);
            if(isMem) {
                if(live_message)
                    await redisClient.set(`${guild_id}-${channel_handle}-live_message`, live_message);
                    
                if(notif_channel) 
                    await redisClient.set(`${guild_id}-${channel_handle}-notif_channel`, notif_channel.id);
            } else {
                return await interaction.reply(`${channel_handle} is not in this Guild's Subscription Set.`)
            }
        } catch(err) {
            console.error(err);
            return await interaction.reply(`Error updating ${channel_handle}'s Options.`)
        }
        await interaction.reply(`Modified ${channel_handle}'s Subscription Options.`);
    }
}