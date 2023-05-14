const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('\'how to\' in a fancy embed'),
    async execute(interaction) {
        await interaction.reply({content: "TODO", ephemeral: false});
    }
}