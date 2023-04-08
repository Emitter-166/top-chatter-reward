import {
    EmbedBuilder
} from "@discordjs/builders";
import {
    client,
    sequelize
} from ".."

export const addKPCodes = async (codes: string[]): Promise < boolean > => {
    const t = await sequelize.transaction({
        autocommit: false
    });

    try {

        const codes_model = sequelize.model('codes');

        let bulk_objects: {
            code: string
        } [] = []

        codes.forEach(code => {
            bulk_objects.push({
                code: code
            });
        })


        await codes_model.bulkCreate(bulk_objects, {
            transaction: t
        });

        t.commit();
        return true;
    } catch (err) {
        console.log(err);
        t.rollback();
        return false;
    }

}

export const getKPCode = async (): Promise < string > => {
    const codes_model = sequelize.model('codes')

    const code_model = await codes_model.findOne();

    if (!code_model) return 'no codes available at the moment, please contact <@861321408357072937> or <@824584513765376032>';

    await code_model.destroy();

    return code_model.get("code") as string;
}

export const seeKPCodes = async (): Promise < string[] > => {
    const codes_model = sequelize.model('codes')
    const all = await codes_model.findAll();

    let res: any = [];

    all.forEach(model => {
        res.push(model.get("code"));
    })
    return res;

}

export const sendKPCode = async (userId: string) => {

    if (!client.isReady()) return;
    try {
        const dm = await (await client.users.fetch(userId)).createDM();

        const embed = new EmbedBuilder()
            .setTitle('Congrats 🙌🥳')
            .setColor([255, 86, 162]);

        const code = await getKPCode();

        let description = `*Congratulations on being one of the top #5 chatters in the last 24 hours! You will be rewarded with a free Kai premium subscription and the top chatter role.* \n\n`
        description += "*use the* `/redeem_gift` *command anywhere in our server and give kai the code* **spoiler ->** ||" + code + "|| *Then patiently wait a few minutes till you get your free kai magic for a week*"

        embed.setDescription(description);

        await dm.send({
            embeds: [embed]
        });
    } catch (err) {
        console.log(err);
    }

}