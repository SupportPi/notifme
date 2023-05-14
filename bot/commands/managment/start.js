const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('starts the bot (in your guild)'),
    pass_redis: true,
    async execute(interaction, redisClient) {
        const guild_id = interaction.guild.id;
        try {
            //if(!redisClient.sIsMember('running', guild_id)){
            await redisClient.sAdd(`running`, guild_id);
            return await interaction.reply({content: "I'll start listening for notifications!", ephemeral: false});
            //} else {
            //    return await interaction.reply({content: "I'm already listening for notifications.", ephemeral: false});
            //}
        } catch (err) {
            console.log(err);
        }
        await interaction.reply({content: "I shouldn't be able to say this unless there's an error...", ephemeral: false});
    }
}