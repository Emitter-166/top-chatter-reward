import { Sequelize, INTEGER, STRING } from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define('code', {
        code: {
            type: STRING
        }
    }, {timestamps: false})
}