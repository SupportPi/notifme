const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('pauses the bots activities (in your guild)'),
    pass_redis: true,
    async execute(interaction, redisClient) {
        try {
            const guild_id = interaction.guild.id;
            //if(redisClient.sIsMember('running', guild_id)){
            await redisClient.sRem(`running`, guild_id);
            return await interaction.reply({content: "I'll stop listening for notifications!", ephemeral: false});
            //} else {
            //    return await interaction.reply({content: "I'm already not listening for notifications.", ephemeral: false});
            //}
        } catch (err) {
            console.log(err)
        }
        await interaction.reply({content: "I shouldn't be able to say this unless there's an error...", ephemeral: false});
    }
}