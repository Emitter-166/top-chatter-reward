import { Client, IntentsBitField} from 'discord.js';
import * as path from 'path';
import * as fs from 'fs';
import { Sequelize, Transaction } from 'sequelize';
import { addKPCodes, getKPCode, seeKPCodes, sendKPCode } from './rewards/kp_code_operations';
import { commands_listener } from './commands';
import { giveTopChatterRole, removeTopChatterRole, topChatterScanner } from './rewards/top_chatter_operations';
import { message_create } from './events/message_create';
import cron from 'node-cron'
import { pickWinners, sendAnnouncement, winner_process } from './winners';


require('dotenv').config({
    path: path.join(__dirname, ".env")
})

export const ROLE_ID = process.env._TC_ROLE_ID
export const ANNOUNCEMENT_CHANNEL_ID = process.env._ANNOUNCEMENT_CHANNEL_ID;

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'top.db',
    logging: false
})


const path_to_models = path.join(__dirname, 'database', 'models');

fs.readdirSync(path_to_models)
    .forEach(modelFile => {
        const model = require(path.join(path_to_models, modelFile));
        model.model(sequelize);
    })





sequelize.sync({alter: true}).then(async sequelize => {
    client.login(process.env._TOKEN);
    
})


const F = IntentsBitField.Flags;
export const client = new Client({
    intents: [F.Guilds, F.GuildMessages, F.GuildMembers, F.MessageContent]
})


client.once('ready', async (client) => {
    console.log("ready");
    commands_listener(client);
    message_create(client);
    topChatterScanner();

    
    winner_process();

    
    cron.schedule('* 24 * * * *', async () => {
        winner_process();
    }, {name: "main"})
})









