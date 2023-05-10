import { Op } from "sequelize";
import { ROLE_ID, client, sequelize } from "..";

export const giveTopChatterRole = async (userId: string): Promise<boolean> => {
    try{
        if(!client.isReady()) return false;
        const guild = await client.guilds.fetch("859736561830592522")
        const member = await guild.members.fetch(userId);

        if(!ROLE_ID){
            console.log("No top chatter roleId provided in .env");
            process.exit(1);
        }

        await member.roles.add(ROLE_ID as string, "top chatter");

        const users_model = sequelize.model('users');

        const [user_model, created] = await users_model.findOrCreate({
            where: {
                userId: userId           
            },
            defaults: {
                lastWinAt: Date.now(),
                hasRole: true
            },
        })

        if(!created){
            await user_model.update({
                lastWinAt: Date.now(),
                hasRole: true
            })
        }

        return true;

    }catch(err){
        console.log(err);
        return false; 
    }
}

export const topChatterScanner = () => {

    setInterval(async () => {

        const users_model = sequelize.model('users');

        //finding users who have expired role
        const users = await users_model.findAll({
            where: {
                hasRole: true,
                lastWinAt: {
                    [Op.lte]: Date.now() - 86400000
                }
            }
        })


        for(let user of users){
            const {userId} = user.dataValues;
            await remove_role(userId)
            await user.update({
                hasRole: false
            })
        }

        
        const allowed_users =  await users_model.findAll({
            where: {
                hasRole: true
            }
        })

        //making sure nobody except top chatter has the role
        const all_server_users = (await (await client.guilds.fetch("859736561830592522")).members.fetch())
            .filter(m => m.roles.cache.has(ROLE_ID as string) && !allowed_users.some(v => v.dataValues.userId === m.user.id));
        
        for(let user of all_server_users){
            await remove_role(user[1].user.id);
        }

        //false safe system

        for(let user of allowed_users){
            const {userId} = user.dataValues;
            await give_role(userId);
        }
        
    }, 60_000)
}

export const remove_role = async (userId: string) => {
    try{
        if(!client.isReady()) throw new Error('Client not ready');
        const guild = await client.guilds.fetch("859736561830592522")
        const member = await guild.members.fetch(userId);

        await member.roles.remove(ROLE_ID as string, "top chatter period of 1 day ended");
    }catch(err){
        console.log("Err at /src/rewards/top_chatter_operations.ts/give_role()");
        console.log(err);
    }
    
}

const give_role = async (userId: string) => {
    try {
        if(!client.isReady()) throw new Error('Client not ready');
        const guild = await client.guilds.fetch("859736561830592522")
        const member = await guild.members.fetch(userId);

        await member.roles.add(ROLE_ID as string, 'didnt have top chatter role');
    } catch (err: any) {
        console.log("Err at /src/rewards/top_chatter_operations.ts/give_role()");
        console.log(err);
    }
}