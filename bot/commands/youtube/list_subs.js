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
            console.log(subs);
            let desc = "";
            for(const sub of subs) {
                const channelId = await redisClient.get(`${guild_id}-${sub}-notif_channel`);
                // channel name
                if(channelId){ 
                    desc += " •\t" + sub + ":" + await redisClient.get(sub) + " is notified in " + `<#${channelId}>`;
                } else {
                    desc +=" •\t" + sub + ":" + await redisClient.get(sub);
                }
                desc+="\n\n";
            }
            const embed = new EmbedBuilder()
            .setTitle("Subscribed Channels")
            .setColor("#CC0000")
            .setDescription(desc || "No Channels Set...")
            .setTimestamp();

            await interaction.reply({content: "Here you go!", embeds: [embed]});
        } catch (err){
            console.error(err);
            interaction.reply("Failed to access guild's subscription set (have you added any?)");
        }
    }
}