const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('subs')
        .setDescription('lists subbed channels')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    pass_redis: true,
    execute: async (interaction, redisClient) => {
        const guild_id = interaction.guild.id;
        try {
            const subs = await redisClient.sMembers(`${guild_id}-subs`);
            let desc = "";
            for(const sub of subs) {
                desc+=" •\t" + sub;
                desc+="\n";
            }
            const embed = new EmbedBuilder()
            .setTitle("Subscribed Channels")
            .setColor("#CC0000")
            .setDescription(desc)
            .setTimestamp();

            console.log(subs);
            await interaction.reply({content: "Here you go!", embeds: [embed]});
        } catch (err){
            console.error(err);
            interaction.reply("Failed to access guild's subscription set (have you added any?)");
        }
    }
}