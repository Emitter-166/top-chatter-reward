import {
    sequelize
} from ".."

export const addKPCodes = async (codes: string[]): Promise < boolean > => {
    const t = await sequelize.transaction({autocommit: false});

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

export const getKPCode = async (): Promise<string> => {
    const codes_model = sequelize.model('codes')

    const code_model = await codes_model.findOne();
    await code_model?.destroy();

    return code_model?.get("code") as string;
}

export const seeKPCodes = async (): Promise<string[]> => {
    const codes_model = sequelize.model('codes')
    const all = await codes_model.findAll();

    let res: any = [];

    all.forEach(model => {
        res.push(model.get("code"));
    })
    return res; 

}