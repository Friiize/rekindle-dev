const { Command } = require('discord-akairo');
const Discord = require('discord.js');
const db = require('../Data/database');
const fs = require('fs');

class UserHandler extends Command {
    constructor() {
        super('user', {
            aliases: ['user'],
            args: [
                {
                    id: "type",
                    type: "string",
                    default: "show"
                },
                {
                    id: "achievement",
                    type: "string",
                    match: 'option',
                    flag: 'achievement:'
                },
                {
                    id: "id",
                    type: "int",
                    match: 'option',
                    flag: 'id:'
                },
            ],
            userPermissions: ['ADMINISTRATOR'],
        });
    }

    async achievement(user, message, args) {
        let [[res]] = await db.execute("SELECT achievements.id FROM achievements WHERE id=?", [args.id]); //Cherche l'id de l'achievement
        let errMsg = "ajouté avec succès.";
        console.log(args)
        console.log(res)

        if (res && args.achievement === "add")  {
            await db.execute(
                "INSERT INTO user_achievement SET user_id=?, achievement_id=?, obtained_at=?",
                [user.id, res.id, message.createdAt]);
            await db.execute(
                "UPDATE users SET modified_by_tag=?, modified_by_id=?, modified_at=? WHERE id=?",
                [message.author.tag, message.author.id, message.createdAt, user.id]);
            errMsg = "ajouté avec succès.";
        } else if (res && args.achievement === "delete") {
            db.execute(
                "DELETE FROM user_achievement WHERE achievement_id=?",
                [args.id]);
            await db.execute(
                "UPDATE users SET modified_by_tag=?, modified_by_id=?, modified_at=? WHERE id=?",
                [message.author.tag, message.author.id, message.createdAt, user.id]);
            errMsg = "supprimé avec succès.";
        } else {
            errMsg = "le haut fait n'existe pas.";
        }
        return message.reply(errMsg);
    }

    attachement(user, message, args) {
        message.attachments.forEach(a => {
            if (a.name === "logo") fs.writeFileSync(`./src/Data/img/${args.serment}/${a.name}`, a.file);
            if (a.name === "footer") fs.writeFileSync(`./src/Data/img/${args.serment}/${a.name}`, a.file);
        })
    }

    async update(user, message, args) {
        let hfList = "";

        let [[res]] = await db.execute("SELECT achievement, description FROM achievements WHERE id=?", [args.id])
        //Vérifie si les args ont des donnée à modifier ou de garder les données actuels
        let achievement = args.achievement || res.achievement;
        let description = args.desc || res.description;

        if (description === "Pas de description") description = res.description;
        if (achievement === "Error") achievement = res.achievement;

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
    }

    async delete(user, message) {
        let hfList = "";
        let rpNames = "";
        let rpSerments = "";
        let rpGames = "";
        let [res] = await db.execute("SELECT * FROM user_achievement ua LEFT JOIN achievements a ON ua.achievement_id = a.id WHERE ua.user_id=? GROUP BY obtained_at DESC", [user.id]);
        let count = (res.length <= 5) ? res.length : 5;

        for (let i = 0; i < count; i++) {
            hfList += "**"+res[i].id + ". " + res[i].achievement + "**\n " + res[i].description + ' \n';
        }

        [res] = await db.execute("SELECT c.rp_name, c.rp_firstname, c.rp_surname, c.rp_age, c.rp_title, c.rp_class, c.assigned_game, s.name FROM rp_characters c LEFT JOIN serments s ON s.id = c.serment_id WHERE c.user_tag=? GROUP BY c.created_at DESC" , [user.tag]);

        count = (res.length <= 7) ? res.length : 7;

        for (let i = 0; i < count; i++) {
            rpNames += res[i].rp_name + " " + res[i].rp_firstname + ", " + res[i].rp_surname + "\n";
            rpSerments += (res[i].name === null) ? "Pas de serments\n" : res[i].name + "\n";
            rpGames += res[i].assigned_game + "\n";
        }

        const userE = new Discord.MessageEmbed()
            .setColor(3582805)
            .setThumbnail(user.avatarURL())
            .setAuthor(user.tag + ' - Supprimé')
            .addField(`Hauts faits`, `${hfList}`, false)
            .addField(`Personnages`, `${rpNames}`, true)
            .addField(`Serments`, `${rpSerments}`, true)
            .addField(`Jeux`, `${rpGames}`, true)
            .setFooter(`${message.author.username}`, `${message.author.avatarURL()}`)
            .setTimestamp();
        await db.execute("DELETE FROM users WHERE user_id=?", [user.id]);
        await db.execute("DELETE FROM rp_characters WHERE user_tag=?", [user.tag]);
        await db.execute("DELETE FROM serments WHERE leader_id=?", [user.id]);
        return message.reply(userE);
    }

    async profile(user, message) {
        let [[res]] = await db.execute("SELECT user_tag FROM users WHERE user_tag=?" , [user.tag]);
        let hfList = "";
        let rpNames = "";
        let rpSerments = "";
        let rpGames = "";

        //console.log(user.tag);
        if (res === undefined) {
            db.execute("INSERT INTO users (user_id, user_tag, created_by_tag, created_by_id, created_at)" + "VALUES (?, ?, ?, ?, ?)",
                [user.id, user.tag, message.author.tag, message.author.id, message.createdAt]);
        }

        [res] = await db.execute("SELECT * FROM user_achievement ua LEFT JOIN achievements a ON ua.achievement_id = a.id WHERE ua.user_id=? GROUP BY obtained_at DESC", [user.id]);

        let count = (res.length <= 5) ? res.length : 5;
        if (count !== 0) {
            for (let i = 0; i < count; i++) {
                hfList += "**"+res[i].id + ". " + res[i].achievement + "**\n " + res[i].description + ' \n';
            }
        } else {
            hfList = '(Vide)';
        }

        let [res2] = await db.execute("SELECT c.rp_name, c.rp_firstname, c.rp_surname, c.assigned_game, s.name FROM rp_characters c LEFT JOIN serments s ON s.id = c.serment_id WHERE c.user_tag=? GROUP BY c.created_at DESC" , [user.tag]);
        //console.log(res2)
        count = (res2.length <= 7) ? res2.length : 7;
        //console.log(count)
        //console.log(res.length)
        if (count !== 0) {
            for (let i = 0; i < count; i++) {
                rpNames += res2[i].rp_name + " " + res2[i].rp_firstname + ", " + res2[i].rp_surname + "\n";
                rpSerments += (res2[i].name === null) ? "Pas de serments\n" : res2[i].name + "\n";
                rpGames += res2[i].assigned_game + "\n";
            }
        } else {
            rpNames = '(Vide)';
            rpSerments = '(Vide)';
            rpGames = '(Vide)';
        }
        //console.log(rpNames);
        //console.log(rpSerments);
        //console.log(rpGames);
        const userE = new Discord.MessageEmbed()
            .setColor(3582805)
            .setThumbnail(user.avatarURL())
            .setAuthor(user.tag)
            .addField(`Hauts faits`, `${hfList}`, false)
            .addField(`Personnages`, `${rpNames}`, true)
            .addField(`Serments`, `${rpSerments}`, true)
            .addField(`Jeux`, `${rpGames}`, true)
            .setFooter(`${message.author.username}`, `${message.author.avatarURL()}`)
            .setTimestamp();
        return message.reply(userE);
    }

    async exec(message, args) {
        //if (!message.member.roles.cache.some(role => role.id == 229291397931466752 || 468519516494757918)) return message.reply("Tu n\'a pas la permission de faire ça.");
        const user = message.mentions.users.first() || message.author;

        if (args.type === "") this.achievement(user, message, args);
        if (args.type === "attachement") this.attachement(user, message, args);
        if (args.achievement === "delete" || args.achievement === "add") this.achievement(user, message, args);
        if (args.type === "update") this.update(user, message, args);
        if (args.type === "delete") this.delete(user, message, args);
        if (args.type === "profile" || args.type === user) this.profile(user, message);

    }
}

module.exports = UserHandler;
