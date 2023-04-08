import { ChannelType, ColorResolvable, GuildTextBasedChannel } from "discord.js";
import { ANNOUNCEMENT_CHANNEL_ID, client, sequelize } from ".";
import { EmbedBuilder } from "@discordjs/builders";
import { giveTopChatterRole } from "./rewards/top_chatter_operations";
import { sendKPCode } from "./rewards/kp_code_operations";

export const pickWinners = async (): Promise<Map<string, number>> => {
    const messages_model = sequelize.model("messages");

    const winners_models = await messages_model.findAll({
        order: [['msg', 'DESC']],
        limit: 5
    })

    const winners = new Map<string, number>();

    winners_models.forEach(model => {
        winners.set(model.get("userId") as string, model.get("msg") as number)
    })
    return winners;
}

export const sendAnnouncement = async (winners: Map<string, number>) => {
    if(!client.isReady()) return;

    const raw_channel = await client.channels.fetch(ANNOUNCEMENT_CHANNEL_ID as string);

    if(!raw_channel) return;
    if(raw_channel.type !== ChannelType.GuildText && raw_channel.type !== ChannelType.GuildAnnouncement) return;

    const channel = raw_channel as GuildTextBasedChannel;

    const embed = new EmbedBuilder()
        .setTitle("Top chatters of the day!")
        .setColor([87,214,255]);
    
    let description = "";
    let content = "";
    winners.forEach((v, k) => {
        description += `**<a:celebration:1094282362579337346> <@${k}> ${v} msg** \n`
        content += `<@${k}>`
    })
    
    description += "\n *You will receive a Kai premium code (via dms) and the top chatter role for a period of 24 hours. You are only allowed to win once a week*"
    embed.setDescription(description);

    channel.send({
        embeds: [embed],
        content: content
    })
}

export const winner_process = async () => {
    const winners = await pickWinners();
    
    for(let winner of winners){
        const userId = winner[0];
        await giveTopChatterRole(userId);
        sendKPCode(userId);
    }
    await sendAnnouncement(winners);

    const messages_model = sequelize.model('messages');
    await messages_model.destroy({
        where: []
    });
}