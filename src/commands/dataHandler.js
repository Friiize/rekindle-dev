const { Command } = require('discord-akairo');
const Discord = require('discord.js');
const fs = require('fs');

class DataHandler extends Command {
    constructor() {
        super('data', {
            aliases : ['data'],
            args : [
                {
                    id : 'create',
                    type : 'string',
                    default : 0
                },
                {
                    id : 'update',
                    type : 'string',
                    default: 1
                }
            ]
        });
    }

    /*create() {
        Discord.Guild.cache.get(647173976396922885).members.each(member => {
            console.log(member);
        })
    }*/

   // update() {}
    exec(message, args) {
        console.log(Discord.Guild.members.fetch());
        (args.create === "create") ? this.create() : console.log("oui");
        (args.update === "update") ? this.update() : console.log("opui");
    }
}

module.exports = DataHandler;
