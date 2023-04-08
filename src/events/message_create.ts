import {
    Client
} from "discord.js";
import {
    sequelize
} from "..";

export const message_create = (client: Client) => {

    const messages_model = sequelize.model("messages");
    const users_model = sequelize.model("users");

    client.on('messageCreate', async msg => {
        if (msg.author.bot) return;
        if(!msg.member) return;
        if(!msg.member.roles.cache.has("924834841890009188")) return;
        
        const t = await sequelize.transaction({ autocommit: false });
    
        try {
            // Check if user has won in the past 7 days
            const user = await users_model.findOne({
                where: {
                    userId: msg.member.id
                },
            });
    
            if (!user || user.get("lastWinAt") as number < Date.now() - 7 * 24 * 60 * 60 * 1000) {
                // User has not won in the past 7 days, record message
                await messages_model.findOrCreate({
                    where: {
                        userId: msg.author.id
                    },
                    transaction: t
                });
    
                await messages_model.increment('msg', {
                    where: {
                        userId: msg.member.id
                    },
                    by: 1,
                    transaction: t
                });
            }

            await t.commit();

        } catch (err) {
            console.log(err);
            await t.rollback();
        }
    
    });
     
}