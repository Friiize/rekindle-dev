const { Command } = require('discord-akairo');
const Discord = require('discord.js');
const db = require('../Data/database');
const fs = require('fs');

class SermentHandler extends Command {
    constructor() {
        super('serment', {
            aliases: ['serment'],
            args: [
                {
                    id: 'option',
                    type: 'string',
                    default: "list"
                },
                {
                    id: "id",
                    type: "int",
                    match: 'option',
                    flag: 'id:'
                },
                {
                    id:"serment",
                    type: "string",
                    default: "Erreur"
                },
                {
                    id: "desc",
                    type: "string",
                    default: "Pas de description"
                },
            ],
            userPermissions: ['ADMINISTRATOR'],
        });
    }

    create(message, args) {
        const user = message.mentions.users.first() || message.author;
        const serment = new Discord.MessageEmbed()
            .setColor(3582805)
            .setTitle('Serment crée : ' + args.serment + '\t\t')
            .setDescription(args.desc)
            .setFooter(`${user.username}`, `${user.avatarURL()}`)
            .setTimestamp();

        db.execute("INSERT INTO serments (name, leader_tag, description, created_by_tag, created_by_id, created_at)" +
            "VALUES (?, ?, ?, ?, ?)", [args.serment, user, args.desc, user.tag, user.id, message.createdAt]).then();

        return message.reply(serment);
    }

    attachement(message, args) {
        message.attachments.forEach(a => {
            if (a.name === "logo") fs.writeFileSync(`./src/Data/img/${args.serment}/${a.name}`, a.file);
            if (a.name === "footer") fs.writeFileSync(`./src/Data/img/${args.serment}/${a.name}`, a.file);
        })
    }

    list(message) {
        const user = message.mentions.users.first() || message.author;
        let hfList = "";

        db.execute("SELECT achievement, description FROM achievements").then(res => {
            for (let i = 0; i < res[0].length; i++) {
                hfList += i+1 + ". " + res[0][i].achievement + ": " + res[0][i].description + '\n';
            }

            const hf = new Discord.MessageEmbed()
                .setColor(3582805)
                .setTitle('Hauts faits : \t\t')
                .setDescription(hfList)
                .setFooter(`${user.username}`, `${user.avatarURL()}`)
                .setTimestamp();
            return message.reply(hf);
        });
    }

    async update(message, args) {
        const user = message.mentions.users.first() || message.author;
        let hfList = "";

        let [[res]] = await db.execute("SELECT achievement, description FROM achievements WHERE id=?", [args.id])
        //Vérifie si les args ont des donnée à modifier ou de garder les données actuels
        let achievement = args.achievement || res.achievement;
        let description = args.desc || res.description;

        if(description === "Pas de description") description = res.description;
        if(achievement === "Error") achievement = res.achievement;

        await db.execute(
            "UPDATE achievements SET achievement=?, description=?, modified_by_tag=?, modified_by_id=?, modified_at=? WHERE id=?",
            [achievement, description, user.tag, user.id, message.createdAt, args.id]);

        hfList += args.id + ". " + res.achievement + ": " + res.description + " -> " + achievement + ": " + description;

        const hf = new Discord.MessageEmbed()
            .setColor(3582805)
            .setTitle('Haut fait modifié : \t\t')
            .setDescription(hfList)
            .setFooter(`${user.username}`, `${user.avatarURL()}`)
            .setTimestamp();
        return message.reply(hf);
    }

    delete(message, args) {
        const user = message.mentions.users.first() || message.author;
        let hfList = "";

        db.execute("SELECT achievement, description FROM achievements").then(res => {
            hfList += args.id + ". " + res[0][args.id].achievement + ": " + res[0][args.id].description
            const hf = new Discord.MessageEmbed()
                .setColor(3582805)
                .setTitle('Haut fait supprimé : \t\t')
                .setDescription(hfList)
                .setFooter(`${user.username}`, `${user.avatarURL()}`)
                .setTimestamp();
            db.execute("DELETE FROM achievements WHERE id=?", [args.id]).then();
            return message.reply(hf);
        });
    }

    exec(message, args) {
        //if (!message.member.roles.cache.some(role => role.id == 229291397931466752 || 468519516494757918)) return message.reply("Tu n\'a pas la permission de faire ça.");
        if (args.option === "create") this.create(message, args);
        if (args.option === "attachement") this.attachement(message, args);
        if (args.option === "list") this.list(message);
        if (args.option === "update") this.update(message, args);
        if (args.option === "delete") this.delete(message, args);

    }
}

module.exports = SermentHandler;
