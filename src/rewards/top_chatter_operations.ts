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

        member.roles.add(ROLE_ID as string, "top chatter");

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
        const users = await users_model.findAll({
            where: {
                hasRole: true,
                lastWinAt: {
                    [Op.lte]: Date.now() - 86400000
                }
            }
        })

        users.forEach(async user => {
            removeTopChatterRole(user.get("userId") as string)
            await user.update({
                hasRole: false
            })
        })
        
    }, 60_000)
}

export const removeTopChatterRole = async (userId: string) => {
    try{
        if(!client.isReady()) return;
        const guild = await client.guilds.fetch("859736561830592522")
        const member = await guild.members.fetch(userId);

        await member.roles.remove(ROLE_ID as string, "top chatter period of 1 day ended");
    }catch(err){
        console.log(err);
    }
    
}