import { Client, EmbedBuilder, PermissionsBitField } from "discord.js";
import { addKPCodes, getKPCode, seeKPCodes } from "./rewards/kp_code_operations";

export const commands_listener = (client: Client) => {
    client.on('messageCreate', async msg => {
        if(!msg.content.toLocaleLowerCase().startsWith("!tc-")) return;
        if(!msg.member?.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return;

        const args = msg.content.split(" ");
        const cmd = args[0].toLowerCase().replace('!tc-', '');

        switch(cmd){
            case 'showcodes':
                const embed = new EmbedBuilder()
                    .setColor('White')
                    .setTitle("Available codes:");

                let description = "```\n";

                const codes = await seeKPCodes();

                codes.forEach(code => {
                    description += code + "\n"
                })

                description += "```";

                embed.setDescription(description);

                await msg.reply({embeds: [embed], allowedMentions: {repliedUser: false}});

                break;

                case 'addcodes':
                    const codes_arr = args.filter((v, i) => i>0);

                    const success = await addKPCodes(codes_arr);

                    if(success){
                        msg.react('✅')
                    }else{
                        msg.react('⛔')
                    }
        }
    })
}