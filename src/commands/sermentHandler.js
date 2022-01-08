const { Command } = require('discord-akairo');
const Discord = require('discord.js');
const db = require('../Data/database');
const fs = require('fs');

class SermentHandler extends Command {
    isCreated = false;

    constructor() {
        super('serment', {
            aliases: ['serment'],
            args: [
                {
                    id: 'option',
                    type: 'string',
                    default: "show"
                },
                {
                    id: "characterId",
                    type: "int",
                    match: 'option',
                    flag: 'characterId:'
                },
                {
                    id: "name",
                    type: "int",
                    match: 'option',
                    flag: 'name:'
                },
                {
                    id: "character",
                    type: "int",
                    match: 'option',
                    flag: 'character:'
                },
                {
                    id: "leader",
                    type: "int",
                    match: 'option',
                    flag: 'leader:'
                },
                {
                    id: "desc",
                    type: "int",
                    match: 'option',
                    flag: 'desc:'
                },
                {
                    id: "assigned",
                    type: "int",
                    match: 'option',
                    flag: 'assigned:'
                },
                {
                    id: "membre",
                    type: "string",
                    match: 'option',
                    flag: 'membre:'
                },
                {
                    id: "sermentId",
                    type: "string",
                    match: 'option',
                    flag: 'sermentId:'
                },
            ],
            userPermissions: ['ADMINISTRATOR'],
        });
    }

    async create(message, args) {
        const user = message.mentions.users.first() || message.author;
        let games = ["Dark Souls", "Dark Souls II", "Dark Souls III", "Demon's Souls", "Bloodborne", "Sekiro", "Elden Ring"];
        let [[res]] = await db.execute("SELECT id FROM rp_characters WHERE id=?", [args.characterId])

        /*if (message.attachments != null && message.author === ",,,,") {
            message.attachments.forEach(a => {
                if (a.name === "logo") fs.writeFileSync(`./src/Data/img/${args.name} ${args.fname}, ${args.sname}/${a.name}`, a.file);
                if (a.name === "footer") fs.writeFileSync(`./src/Data/img/${args.name} ${args.fname}, ${args.sname}/${a.name}`, a.file);
            })
        }*/

        db.execute("INSERT INTO serments (name, leader_id, leader_character_id, description, assigned_game, created_by_tag, created_by_id, created_at)" +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [args.name, args.leader, res.id, args.desc, games[args.assigned], message.author.tag, user.id, message.createdAt]).then(res => {
                console.log(res)
            return message.reply("serment ajoutté");
        });
    }

    attachement(message, args) {
        message.attachments.forEach(a => {
            if (a.name === "logo") fs.writeFileSync(`./src/Data/img/${args.serment}/${a.name}`, a.file);
            if (a.name === "footer") fs.writeFileSync(`./src/Data/img/${args.serment}/${a.name}`, a.file);
        })
    }

    async list(message) {
        const user = message.mentions.users.first() || message.author;
        let nomList = "";
        let leaderList = "";
        let jeuList = "";

        let [res] = await db.execute("SELECT c.rp_name, c.rp_firstname, c.rp_surname, s.name, u.user_tag leader, s.description, s.assigned_game, s.id FROM serments s LEFT JOIN rp_characters c ON c.id = s.leader_character_id LEFT JOIN users u ON u.user_id = s.leader_id");

        for (let i = 0; i < res.length; i++) {
            nomList += res[i].id + ". " + `${res[i].name} \n`;
            leaderList += `${res[i].rp_name} ${res[i].rp_firstname}, ${res[i].rp_surname} (${res[i].leader})\n`;
            jeuList += `${res[i].assigned_game}\n`;
        }

        const serment = new Discord.MessageEmbed()
            .setColor(3582805)
            .setTitle('Serments : \t\t')
            .addField(`Nom`, `${nomList}`, true)
            .addField(`Leader`, `${leaderList}`, true)
            .addField(`Jeux`, `${jeuList}`, true)
            .setFooter(`${message.author.username}`, `${message.author.avatarURL()}`)
            .setTimestamp();
        return message.reply(serment);
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
            .setFooter(`${message.author.username}`, `${message.author.avatarURL()}`)
            .setTimestamp();
        return message.reply(hf);

        ///NOM ET DESC ET CHANGEMENT LEADER
    }

    async membre(user, message, args) {
        let [[res]] = await db.execute("SELECT c.id FROM rp_characters c WHERE id=?", [args.characterId]); //Cherche l'id du rp_character
        let errMsg = "ajouté avec succès.";

        if (res && args.membre === "add")  {
            await db.execute(
                "UPDATE rp_characters SET serment_id=?, joined_at=?, modified_by_tag=?, modified_by_id=?, modified_at=? WHERE id=?",
                [args.sermentId, message.createdAt, message.author.tag, message.author.id, message.createdAt, res.id]);
            errMsg = "ajouté avec succès.";
        } else if (res && args.membre === "delete") {
            db.execute(
                "UPDATE rp_characters SET serment_id=?, joined_at=?, modified_by_tag=?, modified_by_id=?, modified_at=? WHERE id=?",
                [null, null, args.sermentId, message.author.id, message.createdAt, args.characterId]);
            errMsg = "supprimé avec succès.";
        } else {
            errMsg = "l'utilisateur n'existe pas.";
        }
        return message.reply(errMsg);
    }

    async delete(message, args) {
        const user = message.mentions.users.first() || message.author;
        let memberList = "";
        let [[res]] = await db.execute("SELECT c.rp_name, c.rp_firstname, c.rp_surname, s.name, u.user_tag leader, s.description, s.assigned_game, s.id FROM serments s LEFT JOIN rp_characters c ON c.id = s.leader_character_id LEFT JOIN users u ON u.user_id = s.leader_id WHERE s.id=?", [args.sermentId]);
        //console.log(res);
        let [res2] = await db.execute("SELECT c.rp_name, c.rp_firstname, c.rp_surname FROM rp_characters c WHERE serment_id=?", [res.id]);
        console.log(res2);

        if(!res2) {
            memberList = "Pas de membres";
        }
        else {
            for (let i = 0; i < res2.length; i++) {
                memberList += `${res2[i].rp_name} ` + `${res2[i].rp_firstname}`+ `, ${res2[i].rp_surname} \n`;
            }
        }

        const rp = new Discord.MessageEmbed()
            .setColor(3582805)
            .setThumbnail(user.avatarURL())
            .setAuthor(`${res.name}` + ` - ` + res.assigned_game + ' - Supprimé')
            .setDescription(res.description)
            .addField(`Leader`, `${res.rp_name} ${res.rp_firstname}, ${res.rp_surname} (${res.leader})`, false)
            .addField(`Membres`, `${memberList}`, true)
            .setFooter(`${message.author.username}`, `${message.author.avatarURL()}`)
            .setTimestamp();
        await db.execute("DELETE FROM users WHERE user_id=?", [user.id]);
        await db.execute("UPDATE rp_characters SET serment_id=?, joined_at=?, modified_by_tag=?, modified_by_id=?, modified_at=? WHERE serment_id=?", [null, null, args.sermentId, message.author.id, message.createdAt, args.sermentId]);
        return message.reply(rp);
    }

    async profile(message, args) {
        const user = message.mentions.users.first() || message.author;
        let memberList = "";
        let [[res]] = await db.execute("SELECT c.rp_name, c.rp_firstname, c.rp_surname, s.name, u.user_tag leader, s.description, s.assigned_game, s.id FROM serments s LEFT JOIN rp_characters c ON c.id = s.leader_character_id LEFT JOIN users u ON u.user_id = s.leader_id WHERE s.id=?", [args.sermentId]);
        //console.log(res);
        let [res2] = await db.execute("SELECT c.rp_name, c.rp_firstname, c.rp_surname FROM rp_characters c WHERE serment_id=?", [res.id]);
        console.log(res2);

        if(!res2) {
            memberList = "Pas de membres";
        }
        else {
            for (let i = 0; i < res2.length; i++) {
                memberList += `${res2[i].rp_name} ` + `${res2[i].rp_firstname}`+ `, ${res2[i].rp_surname} \n`;
            }
        }

        const rp = new Discord.MessageEmbed()
            .setColor(3582805)
            .setThumbnail(user.avatarURL())
            .setAuthor(`${res.name}` + ` - ` + res.assigned_game)
            .setDescription(res.description)
            .addField(`Leader`, `${res.rp_name} ${res.rp_firstname}, ${res.rp_surname} (${res.leader})`, false)
            .addField(`Membres`, `${memberList}`, true)
            .setFooter(`${message.author.username}`, `${message.author.avatarURL()}`)
            .setTimestamp();
        return message.reply(rp);
    }

    exec(message, args) {
        //if (!message.member.roles.cache.some(role => role.id == 229291397931466752 || 468519516494757918)) return message.reply("Tu n\'a pas la permission de faire ça.");
        const user = message.mentions.users.first() || message.author;

        if (args.option === "create") this.create(message, args);
        //if (args.option === "attachement") this.attachement(message, args);
        if (args.option === "list") this.list(message);
        if (args.option === "update") this.update(message, args);
        if (args.membre === "delete" || args.membre === "add") this.membre(user, message, args);
        if (args.option === "delete") this.delete(message, args);
        if (args.option === "show") this.profile(message, args, this.isCreated);
        if (args.option === "game") this.game(message);

    }rs
}

module.exports = SermentHandler;
