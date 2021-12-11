const { Command } = require('discord-akairo');
const Discord = require('discord.js');
const fs = require('fs');

class User extends Command {
    constructor() {
        super('user', {
            aliases: ['user'],
            args : [
                {
                    id: 'option',
                    type: 'string',
                    default: 0
                },
                {
                    id: 'hf',
                    type: 'string',
                    default: 1
                },
                {
                    id: 'serment',
                    type: 'string',
                    default: 2
                }
            ]
        });
    }

    exec(message, args) {
        const data = JSON.parse(fs.readFileSync('./src/Data/user.json', 'utf8'));
        const user = message.mentions.users.first() || message.author;
        (!data[user.id]) ? data[user.id] = user.id : null;
        const userHF = new Discord.MessageEmbed()
            .setColor(15275567)
            .setAuthor(`${user.username}`, `${user.avatarURL()}`)
            .setTitle('Haut faits Rekindle : \t\t')
            .setDescription(data[user.username].hf)
            .setThumbnail(user.avatarURL())
            .setFooter('Ver. 0.2.0')
            .setTimestamp()
        return message.reply(userHF);
    }
}

module.exports = User;
