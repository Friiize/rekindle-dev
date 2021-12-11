const { Command } = require('discord-akairo');
const Discord = require('discord.js');
const client = new Discord.Client();

class Spam extends Command {

    constructor() {
        super('d', {
            aliases: ['d'],
            args: [
                {
                    id : 'msg',
                    type: 'string',
                    default: 0
                }
            ],
        });
        this.isReady = false;
    }

    exec(message, args) {
        //Suprrime la commande tapé
        message.delete();
        if (args.msg === "bump") {
            if (!this.isReady) {
                setTimeout(() => {
                    this.isReady = false;
                    return message.channel.send("@here , un !d bump est disponible");
                    }, 10 * 1000);
                this.isReady = true;
            }
        }
    }
}

module.exports = Spam;
