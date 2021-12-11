const { AkairoClient, CommandHandler, ListenerHandler, SequelizeProvider} = require('discord-akairo');
const mysql = require('mysql2');
require('dotenv').config();

class MyClient extends AkairoClient {
    constructor() {
        super({
            ownerID: '207142538069540864'
        }, {
           // disableMentions:'everyone'
        });

        this.command = new CommandHandler(this, {
            directory: 'src/commands',
            prefix: '!'
        });

        this.listenerHandler = new ListenerHandler(this, {
            directory: 'src/listeners'
        });

        this.command.loadAll();
    }


}



const client = new MyClient();
client.login(process.env.TOKEN);
client.on('ready', () => {
    console.log("ready");
    client.user.setPresence({
        activity: {
            name: 'restaurer la dictature'
        },
        status: 'online'
    })

})
