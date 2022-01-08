const { Command } = require('discord-akairo');
const Discord = require('discord.js');
const db = require('../Data/database');
const fs = require('fs');

class SermentHandler extends Command {
    isCreated = false;

    constructor() {
        super('rp', {
            aliases: ['rp'],
            args: [
                {
                    id: 'option',
                    type: 'string',
                    default: "show"
                },
                {
                    id: "id",
                    type: "int",
                    match: 'option',
                    flag: 'id:'
                },
                {
                    id: "name",
                    type: "int",
                    match: 'option',
                    flag: 'name:'
                },
                {
                    id: "fname",
                    type: "int",
                    match: 'option',
                    flag: 'fname:'
                },
                {
                    id: "sname",
                    type: "int",
                    match: 'option',
                    flag: 'sname:'
                },
                {
                    id: "age",
                    type: "int",
                    match: 'option',
                    flag: 'age:'
                },
                {
                    id: "title",
                    type: "int",
                    match: 'option',
                    flag: 'title:'
                },
                {
                    id: "class",
                    type: "int",
                    match: 'option',
                    flag: 'class:'
                },
                {
                    id: "assigned",
                    type: "int",
                    match: 'option',
                    flag: 'assigned:'
                },
                {
                    id: "bs",
                    type: "int",
                    match: 'option',
                    flag: 'bstory:'
                },
            ],
            userPermissions: ['ADMINISTRATOR'],
        });
    }

    create(message, args) {
        const user = message.mentions.users.first() || message.author;
        let games = ["Dark Souls", "Dark Souls II", "Dark Souls III", "Demon's Souls", "Bloodborne", "Sekiro", "Elden Ring"];
        console.log(args);
        console.log(message.attachments);

        /*if (message.attachments != null && message.author === ",,,,") {
            message.attachments.forEach(a => {
                if (a.name === "logo") fs.writeFileSync(`./src/Data/img/${args.name} ${args.fname}, ${args.sname}/${a.name}`, a.file);
                if (a.name === "footer") fs.writeFileSync(`./src/Data/img/${args.name} ${args.fname}, ${args.sname}/${a.name}`, a.file);
            })
        }*/

        db.execute("INSERT INTO rp_characters (rp_name, rp_firstname, rp_surname, rp_age, rp_title, rp_class, assigned_game, rp_backstory, user_tag, created_by_tag, created_by_id, created_at)" +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ? ,? ,?, ?)", [args.name, args.fname, args.sname, args.age, args.title, args.class, games[args.assigned], args.bs, user.tag, message.author.tag, user.id, message.createdAt]).then(res => {
            return message.reply(this.profile(message, args, true));
        });
    }

    async attachement(message, args) {
        let [[res]] = await db.execute("SELECT rp_name, rp_firstname, rp_surname FROM rp_characters WHERE id=?" , [args.id]);
        message.attachments.forEach(a => {
            if (a.name === "logo") fs.writeFileSync(`./src/Data/img/${res.rp_name} ${res.rp_firstname}, ${res.rp_surname}/${a.name}`, a.file);
            if (a.name === "footer") fs.writeFileSync(`./src/Data/img/${res.rp_name} ${res.rp_firstname}, ${res.rp_surname}/${a.name}`, a.file);
        })
    }

    async list(message) {
        const user = message.mentions.users.first() || message.author;
        let rpNames = "(Vide)";
        let rpSerments = "(Vide)";
        let rpGames = "(Vide)";
        let [res] = await db.execute("SELECT c.id, c.rp_name, c.rp_firstname, c.rp_surname, c.rp_age, c.rp_title, c.rp_class, c.assigned_game, s.name FROM rp_characters c LEFT JOIN serments s ON s.id = c.serment_id WHERE c.user_tag=? GROUP BY c.created_at DESC" , [user.tag]);
        let count = (res.length <= 7) ? res.length : 7;

        //console.log(res);
        for (let i = 0; i < count; i++) {
            rpNames += res[i].id + '. ' + `${(res[i].rp_name === null) ? "" :res[i].rp_name} ` + `${(res[i].rp_firstname === null) ? "" :res[i].rp_firstname}`+ `${(res[i].rp_surname === null) ? "" : `,` + res[i].rp_surname}` + "\n";
            rpSerments += (res[i].name === null) ? "Pas de serments\n" : res[i].name + "\n";
            rpGames += `${(res[i].rp_assigned_game === null) ? "Non assigné" : res[i].assigned_game}` + "\n";
        }

        console.log(rpNames)
        console.log(rpSerments)
        console.log(rpGames)
        const hf = new Discord.MessageEmbed()
            .setColor(3582805)
            .setTitle(`Personnages de ${user.username} \t\t'`)
            .addField(`Nom complet`, `${rpNames}`, true)
            .addField(`Serments`, `${rpSerments}`, true)
            .addField(`Jeux`, `${rpGames}`, true)
            .setFooter(`${message.author.username}`, `${message.author.avatarURL()}`)
            .setTimestamp();
        return message.reply(hf);
    }

    async update(message, args) {
        const user = message.mentions.users.first() || message.author;
        let games = ["Dark Souls", "Dark Souls II", "Dark Souls III", "Demon's Souls", "Bloodborne", "Sekiro", "Elden Ring"];
        let [[res]] = await db.execute("SELECT c.rp_name, c.rp_firstname, c.rp_surname, c.rp_age, c.rp_title, c.rp_class, c.assigned_game FROM rp_characters c WHERE c.user_tag=? AND c.id=?" , [user.tag, args.id]);

        //Vérifie si les args ont des donnée à modifier ou de garder les données actuels
        let name = args.name || res.rp_name;
        let fname = args.fname || res.rp_firstname;
        let sname =  args.sname || res.rp_surname;
        let age = args.age || res.rp_age;
        let title = args.title || res.rp_age;
        let rpClass = args.class || res.rp_class;
        let assigned = games[args.assigned] || res.assigned_game;
        let changeList = "";

        await db.execute(
            "UPDATE rp_characters SET rp_name=?, rp_firstname=?, rp_surname=?, rp_age=?, rp_title=?, rp_class=?, assigned_game=?, modified_by_tag=?, modified_by_id=?, modified_at=? WHERE id=?",
            [name, fname, sname, age, title, rpClass, assigned, user.tag, user.id, message.createdAt, args.id]);

        if (args.name != null) changeList += args.id + ". " + res.rp_name + " -> " + name + '\n';
        if (args.fname != null) changeList += '\t' + res.rp_firstname + " -> " + fname + '\n';
        if (args.sname != null) changeList += '\t' + res.rp_surname + " -> " + sname + '\n';
        if (args.age != null) changeList += '\t' + res.rp_age + " -> " + age + '\n';
        if (args.title != null) changeList += '\t' + res.rp_title + " -> " + title + '\n';
        if (args.class != null) changeList += '\t' + res.rp_class + " -> " + rpClass + '\n';
        if (args.assigned != null) changeList += '\t' + res.assigned_game + " -> " + assigned + '\n';

        const rp = new Discord.MessageEmbed()
            .setColor(3582805)
            .setTitle('Personnage modifié : \t\t')
            .setDescription(changeList)
            .setFooter(`${message.author.username}`, `${message.author.avatarURL()}`)
            .setTimestamp();
        return message.reply(rp);
    }

    async delete(message, args) {
        const user = message.mentions.users.first() || message.author;
        let [[res]] = await db.execute("SELECT rp_name, rp_firstname, rp_surname FROM rp_characters WHERE id=?", [args.id]);
        const hf = new Discord.MessageEmbed()
            .setColor(3582805)
            .setTitle('Personnage supprimé : \t\t')
            .setDescription(`${res.rp_name} ` + `${res.rp_firstname}`+ `, ${res.rp_surname}` + ` - ` + user.tag)
            .setFooter(`${message.author.username}`, `${message.author.avatarURL()}`)
            .setTimestamp();

        await db.execute("DELETE FROM rp_characters WHERE id=?", [args.id]);
        return message.reply(hf);
    }

    async profile(message, args, isCreated) {
        const user = message.mentions.users.first() || message.author;

        let [[res]] = await db.execute("SELECT c.rp_name, c.rp_firstname, c.rp_surname, c.rp_age, c.rp_title, c.rp_class, c.assigned_game, c.rp_backstory, s.name FROM rp_characters c LEFT JOIN serments s ON s.id = c.serment_id WHERE c.user_tag=?" , [user.tag]);
        console.log(res)
        const rp = new Discord.MessageEmbed()
            .setColor(3582805)
            .setThumbnail(user.avatarURL())
            .setAuthor(`${(res.rp_name === null) ? "" :res.rp_name} ` + `${(res.rp_firstname === null) ? "" :res.rp_firstname}`+ `${(res.rp_surname === null) ? "" : `,` + res.rp_surname}` + ` - ` + user.tag)
            .setDescription((res.rp_backstory === null) ? "Pas de description" : res.rp_backstory)
            .addField(`Titre`, `${(res.rp_title === null) ? "Pas de titre" : res.rp_title}`, false)
            .addField(`Serment`, `${(res.name === null) ? "Pas de serments\n" : res.name + "\n"}`, true)
            .addField(`Class`, `${(res.rp_class === null) ? "Pas indiqué" : res.rp_class}`, false)
            .addField(`Âge`, `${(res.rp_age === null) ? "Pas indiqué" : res.rp_age}`, true)
            .addField(`Jeux`, `${(res.rp_assigned_game === null) ? "Non assigné" : res.assigned_game}`, true)
            .setFooter(`${message.author.username}`, `${message.author.avatarURL()}`)
            .setTimestamp();
        return message.reply(rp);
    }

    game(message) {
        const user = message.mentions.users.first() || message.author;
        let games = ["Dark Souls", "Dark Souls II", "Dark Souls III", "Demon's Souls", "Bloodborne", "Sekiro", "Elden Ring"];
        let gameList = "";
        for (let i = 0; i < games.length; i++) {
            gameList += "**" + i + ". " + games[i] + "**\n";
        }
        const rp = new Discord.MessageEmbed()
            .setColor(3582805)
            .setTitle("Jeux Fromsoftware")
            .setDescription(gameList)
            .setFooter(`${user.username}`, `${user.avatarURL()}`)
            .setTimestamp();
        return message.reply(rp);
    }

    exec(message, args) {
        //if (!message.member.roles.cache.some(role => role.id == 229291397931466752 || 468519516494757918)) return message.reply("Tu n\'a pas la permission de faire ça.");
        if (args.option === "create") this.create(message, args);
        //if (args.option === "attachement") this.attachement(message, args);
        if (args.option === "list") this.list(message);
        if (args.option === "update") this.update(message, args);
        if (args.option === "delete") this.delete(message, args);
        if (args.option === "show") this.profile(message, args, this.isCreated);
        if (args.option === "game") this.game(message);

    }
}

module.exports = SermentHandler;
