import { Sequelize, INTEGER, CHAR } from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define('users', {
        userId: {
            type: CHAR(30)
        },
        lastWinAt: {
            type: INTEGER,
            defaultValue: 0
        }
    }, {timestamps: false})
}