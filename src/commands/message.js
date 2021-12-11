const { Command } = require('discord-akairo');
const Discord = require('discord.js');

class Message extends Command {
    constructor() {
        super('msg', {
            aliases: ['msg'],
            args: [
                {
                    id:'msg',
                    type:'string',
                    default: 0
                }
            ]
        });
    }

    exec(message, args) {
        message.delete();
        const embedMsg = new Discord.MessageEmbed()
            .setColor(15275567)
            .setAuthor(`${message.author.username}`, `${message.author.avatarURL()}`)
            .setDescription(`${args.msg}`)
        return message.reply(embedMsg);
    }
}

module.exports = Message;
