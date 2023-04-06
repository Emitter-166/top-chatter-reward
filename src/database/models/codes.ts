import { Sequelize, INTEGER, STRING, CHAR } from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define('codes', {
        code: {
            type: CHAR(255),
            allowNull: false,
            unique: true
        }
    }, {timestamps: false})
}