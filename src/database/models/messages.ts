import { Sequelize, INTEGER, CHAR } from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define('messages', {
        userId: {
            type: CHAR(30),
            allowNull: false
        },
        msg: {
            type: INTEGER,
            defaultValue: 0
        }
    }, {timestamps: false})
}