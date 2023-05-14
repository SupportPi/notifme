const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('displays the status of the Bot (in your guild) to you (ephemeral)'),
    pass_redis: true,
    async execute(interaction, redisClient) {
        const ephemeral = false;
        const guild_id = interaction.guild.id;
      
        try {
            const isMem = await redisClient.sIsMember(`running`, guild_id);
            if(isMem)
                return await interaction.reply({content: "I'm currently active.", ephemeral: ephemeral});
            else 
                return await interaction.reply({content: "I'm not currently active.", ephemeral: ephemeral});
        } catch (err) {
            console.log(err);
        }
        throw new Error("Failed to check my status.");
    }
}