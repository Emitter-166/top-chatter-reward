import {
    Client
} from "discord.js";
import {
    sequelize
} from "..";

export const message_create = (client: Client) => {

    const messages_model = sequelize.model('messages');

    client.on('messageCreate', async msg => {
        if (msg.author.bot) return;

        const t = await sequelize.transaction({autocommit: false});
        
        await messages_model.findOrCreate({
            where: {
                userId: msg.author.id
            },
            transaction: t
        })

        await messages_model.increment('msg', {
            where: {
                userId: msg.author.id
            },
            by: 1,
            transaction: t
        })

        try{
            await t.commit()
        }catch(err){
            console.log(err);
            await t.rollback();
        }

    })
}