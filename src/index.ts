import { Client, IntentsBitField} from 'discord.js';
import * as path from 'path';
import * as fs from 'fs';
import { Sequelize} from 'sequelize';
import { commands_listener } from './commands';
import { topChatterScanner } from './rewards/top_chatter_operations';
import { message_create } from './events/message_create';
import cron from 'node-cron'
import {winner_process} from './winners';


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

    
    cron.schedule('0 0 * * *', async () => {
        winner_process();
    }, {name: "main"})
})









