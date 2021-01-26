const fs = require('fs');
const Discord = require('discord.js');
const bot = new Discord.Client();
'use strict';

// Read config file variables
const config = require("./config.json")
const { name, prefix, token, disboard } = require('./config.json');

// Create new commands collection
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

// Set command files directory
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Read command files
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

bot.msgs = require("./ressources/json/ideas.json");
bot.polls =require("./ressources/json/polls.json");

const ffmpeg = require("ffmpeg");
const opus = require("opusscript");
const ytdl = require("ytdl-core-discord");
const yts = require("yt-search");
const queue = new Map();

function length(obj) {
    return Object.keys(obj).length;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// Set bot activity
bot.once('ready', function(){
    console.log('Connected');
	bot.user.setUsername(name);
	bot.user.setAvatar('./ressources/img/avatar.png');
    bot.user.setActivity('Chamallow party !')
})

client.on('error', console.error);

bot.on('message', function(message){
	// Check if message don't start with command prefix or if author is a bot
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	// Check if command name is not null
	if (!client.commands.has(commandName)) return;

	// Get command through his name or aliases
	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	// Check if command exist
	if (!command) return;
	
	// Check if command is guild only and if the channel is guild or DM
	if (command.guildOnly && message.channel.type === 'dm') {
		return message.reply('Je ne peux exécuter cette commande en message privé!');
	}

	if (command.permissions) {
		const authorPerms = message.channel.permissionsFor(message.author);
		if (!authorPerms || !authorPerms.has(command.permissions)) {
			return message.reply('Vous n\'avez pas la permission d\'exécuter cette commande!');
		}
	}

	// Check if command has arguments
	if (command.args && !args.length) {
		let reply = `Arguments manquants, ${message.author}!`;

		// Check if command has usage configured and send it
		if (command.usage) {
			reply += `\nVeuillez utiliser: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	// Check if command has cooldown
	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	// Check cooldown of the command for the user
	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`Veuillez attendre ${timeLeft.toFixed(1)} seconde(s) avant d'utiliser la commande \`${command.name}\` .`);
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	}

	// Try to execute command
	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('Erreur lors de l\'exécution de cette commande!');
	}

    const serverQueue = queue.get(message.guild.id);
    
    if (message.channel.id === "613684354421620766") {
        message.react("👎");
        message.react("👍");
    } else if (message.content === `${prefix}vote`) {
        message.channel.send(":mouse_three_button: Lien pour voter: " + disboard)
    } else if (message.channel.id === "710089322111565874") {
        if(message.content=== `${prefix}next`) {
                var actual = bot.msgs.actual
                if (actual > length(bot.msgs)-1) {
                    actual = 1;
                }

                var _message = bot.msgs[actual.toString()].text;
                var _author = bot.msgs[actual.toString()].author;
                bot.channels.get("710089322111565874").send("Idée du Jour n°" + actual + " proposé par <@" + _author + ">\n\n**" + _message + "**");
                bot.msgs ["actual"]= actual+1;
                fs.writeFile("./ressources/json/ideas.json", JSON.stringify(bot.msgs, null, 4), err =>{
                            if(err) throw err;
                });
        } else if(message.content.startsWith(`${prefix}goto`)){
            var newa = parseInt(message.content.slice(6),10);

            if (newa>length(bot.msgs)-1) {
                newa = 1
            }

            bot.msgs ["actual"]= newa;
            fs.writeFile("./ressources/json/ideas.json", JSON.stringify(bot.msgs, null, 4), err =>{
                            if(err) throw err;
            });

            var actual = parseInt(bot.msgs.actual,10);

            if (actual > length(bot.msgs)-1) {
                actual = 1;
            }

            var _message = bot.msgs[actual.toString()].text;
            var _author = bot.msgs[actual.toString()].author;
            bot.channels.cache.get("710089322111565874").send("Idée du Jour n°" + actual + " proposé par <@" + _author + ">\n\n**" + _message + "**");
            bot.msgs ["actual"]= actual+1;
            fs.writeFile("./ressources/json/ideas.json", JSON.stringify(bot.msgs, null, 4), err =>{
                if(err) throw err;
            });
        } else if (message.content === `${prefix}last`) {
            bot.msgs ["actual"]= length(bot.msgs)-1;

            fs.writeFile("./ressources/json/ideas.json", JSON.stringify(bot.msgs, null, 4), err =>{
                            if(err) throw err;
            });

            message.channel.send("L'idée du jour de demain sera la dernière proposée (Idée n°"+bot.msgs["actual"]+")");
        }
    } 
    else if (message.content === `${prefix}help`) {
        var embed = new Discord.MessageEmbed()
            .setTitle("Liste de commandes basiques")
            .addField(":question: Pour afficher cette liste", prefix + "help")
            .addField(":mouse_three_button: Pour aller voter", prefix + "vote")
            .setColor("0x2ecc71")
   
        message.channel.send(embed);
        var m_embed = new Discord.MessageEmbed()
            .setTitle("Liste des commandes de musique !")
            .addField(":musical_note: Pour lancer une musique", "/play (ou /p) + titre")
            .addField(":fast_forward: Pour passer à la musique suivante", "/skip (ou /s)")
            .addField(":stop_button: Pour arrêter la musique", "/stop")
            .addField(":pause_button: Pour mettre la musique en pause", "/pause")
            .addField(":play_pause: Pour remettre la musique", "/resume")
            .addField(":one: Pour le morceau n°1 de Christophe_", "/chris 1")
            .addField(":two: Pour le morceau n°2 de Christophe_", "/chris 2")
            .addField(":three: Pour le morceau n°3 de Christophe_", "/chris 3 (ou /chris akla)")
            .addField(":x: Pour faire partir le bot du salon", "/disconnect (ou /dc)")
            .setColor("0x2ecc71")
            message.channel.send(m_embed);
    } else if (message.channel.id === "710089289895247933") {
        if (message.author.id != "630021989494685696") {
            var nbr = length(bot.msgs);
                bot.msgs [nbr.toString()] = {
                    text: message.content,
                    author: message.author.id
                }

                fs.writeFile("./ressources/json/ideas.json", JSON.stringify(bot.msgs, null, 4), err =>{
                    if(err) throw err;
                    var count = length(bot.msgs)-1;

                    message.reply("ton idée a bien été enregistrée ! (Idée n°"+count+")");
                    message.delete();
                });
        }
    } else if(message.content.startsWith(`${prefix}reload`)){
        if(message.content.slice(8) === "premium"){
            let author = message.guild.members.cache.find(x => x.user.username===message.author.username);
            let prem = message.guild.roles.cache.find(role => role.name === "Premium");
            if(author.roles.cache.find(x => x === prem)){
                message.reply('yes')
            }else{
                message.reply('no')
            }
            message.guild.members.cache.forEach(m => {
                if(m.roles.cache.find(x => x === prem)){
                    if(m.nickname != null){
                         if(!m.nickname.endsWith('★')){
                        m.setNickname(m.nickname+'★');
                        message.guild.channels.cache.get('710107114810376212').send(m.nickname+" est passé premium!")
                         }
                    }
                   
                }else{
                    if(m.nickname != null){
                      if(m.nickname.endsWith('★')){
                        m.setNickname(m.nickname.replace('★', ''));
                        message.guild.channels.cache.get('710107114810376212').send(m.nickname+" n'est plus premium!")
                        }  
                    }
                    
                }
            })
        }
    } else if (message.content.startsWith(`${prefix}clear`) || message.content.startsWith(`${prefix}purge`)){
		const args = message.content.split(' ').slice(1);
		const amount = args.join(' ');

        if (message.deletable) {
            message.delete();
        }

        if (!message.member.hasPermission("MANAGE_MESSAGES")) {
            return message.reply("Vous n'avez pas l'autorisation de faire ça...").then(m => m.delete(5000));
        }

        if (isNaN(amount) || parseInt(amount) <= 0) {
            return message.reply("Met un nombre > 0 et pas de lettres").then(m => m.delete(5000));
        }

        if (!message.guild.me.hasPermission("MANAGE_MESSAGES")) {
            return message.reply("Il me manque des permissions !").then(m => m.delete(5000));
        }

        let deleteAmount = parseInt(amount) + 1;

        if (deleteAmount > 100) {
            deleteAmount = 100;
        }

        message.channel.bulkDelete(deleteAmount, true)
            .then(deleted => message.channel.send(` \`${deleted.size}\` messages ont été supprimés.`))
            .catch(err => message.reply(`Oops... ${err}`));
    } else if (message.content.startsWith(`${prefix}fight`)) {
        if(message.mentions.everyone) {
            message.delete();
            return message.reply('Merci de sélectionner un utilisateur précis !')
        }

        let p1 = message.author;
        let p2 = message.mentions.users.first();
        if (p2 === undefined) {
            message.delete();
            return message.reply('Merci de sélectionner un utilisateur précis !')
        } else if(p1 === p2) {
            message.delete();
            return message.reply("T'es bête ou quoi")
        }

        let l1 = getRandomInt(getRandomInt(getRandomInt(100)));
        let l2 = getRandomInt(getRandomInt(getRandomInt(100)));
        if (l1 < l2) {
            return message.channel.send("Le vainqueur est <@"+p1.id+"> ! :trophy:");
        } else if(l2 < l1) {
            return message.channel.send("Le vainqueur est <@"+p2.id+"> ! :trophy:");
        } else {
            return message.channel.send("Égalité parfaite ! :pensive:");
        }
    } else if (message.content.startsWith(`${prefix}play`) || message.content.startsWith(`${prefix}p`)) {
		execute(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}skip`) || message.content.startsWith(`${prefix}s`)) {
		skip(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}stop`)) {
		stop(message, serverQueue);
		return;
    } else if (message.content.startsWith(`${prefix}pause`)) {
        pause(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}resume`)) {
        resume(message, serverQueue);
        return;
    }
    else if (message.content.startsWith(`${prefix}disconnect`)|| message.content.startsWith(`${prefix}dc`)) {
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            message.channel.send('Vous n\'êtes dans aucun salon !');
        } else {
            voiceChannel.leave();
            message.channel.send(':x: Deconnexion du salon !');
        }
    }
    else if (message.content === `${prefix}record`) {
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            message.channel.send('Vous n\'êtes dans aucun salon !');
        } else {
            record(voiceChannel);
        }
    } else if (message.content === `${prefix}strec`) {
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            message.channel.send('Vous n\'êtes dans aucun salon !');
        } else {
            stop_record(voiceChannel, message);
        }
    } else if(message.content.startsWith(`${prefix}debug`)) {
        if (message.content.includes('roles')) {
            var answer = "Debug menu for roles:";
            message.guild.roles.cache.forEach(r => {
                answer += "\n\n"+r.name.replace('@', '')+" : `"+r.id+"`";
            })
            message.channel.send(answer);
        } else if (message.content.includes('emojis')) {
            var answer = "Debug menu for emojis:";
            message.guild.emojis.cache.forEach(emoji => {
                if(answer.length > 1000){
                    message.channel.send(answer);
                    answer = ""
                }
                answer += "\n\n<:"+emoji.name+":"+emoji.id+"> -> "+emoji.name.replace('_', '\_')+" : `"+emoji.id+"`";
            })
            
            
        }
        
    }
    else if(message.content.includes(`${prefix}forms`)){
        const cont = message.content.split("/forms ");
        const args = cont[1].split('¤');
        let candidatname = args[0].split('#');
        let candidat = message.guild.members.cache.find(x => x.user.username===candidatname[0]);
        let candidatRole = message.guild.roles.cache.find(role => role.name === "Candidature");
        candidat.roles.add(candidatRole);
        var embed = message.embeds;
        message.guild.channels.cache.get('720308538173554781').send("Nouvelle candidature de <@" + candidat.user.id + "> !")
        message.guild.channels.cache.get('720308538173554781').send(embed).then(m => {
            m.react("👍");
            m.react("👎");
        });
        
    }

    })


    bot.on("guildMemberAdd", (member) => {
        if(member.user.username.toLowerCase().includes("discord.gg")){
            member.ban();
            bot.channels.cache.get("644156102690209820").lastMessage.delete()
            bot.channels.cache.get("624587022660665355").send("*BAN DE L'UTILISATEUR: <@"+member.user.id+">*");
        }
        else{
        const guild = member.guild;
        const defaultChannel = guild.channels.cache.get('644156102690209825');
        defaultChannel.send("Bienvenue <@"+member.id+"> !")
        defaultChannel.send("Pour avoir accès à tous le serveur merci de mettre un :thumbsup: sous le <#614482156001034270>")
        }
    });
    
    bot.on("guildMemberUpdate", (oldM, newM) => {
        let prem = bot.guilds.cache.find(guild => guild.id ==="596754524392259584").roles.cache.find(role => role.name === "Premium");
        if(!oldM.roles.cache.find(x => x === prem) && newM.roles.cache.find(x => x === prem)){
            if(oldM.nickname != null){
                newM.setNickname(oldM.nickname+'★');
                bot.channels.cache.get('710107114810376212').send("<@"+newM.user.id+"> est passé premium!")  
            }
           
        }
        else if(oldM.roles.cache.find(x => x === prem) && !newM.roles.cache.find(x => x === prem)){
            if(oldM.nickname != null){
                if(oldM.nickname.endsWith('★')){
                    newM.setNickname(oldM.nickname.replace('★',''));
                }
            bot.channels.cache.get('710107114810376212').send("<@"+newM.user.id+"> n'est plus premium!")
            }
           
        }
        else if(oldM.roles.cache.find(x => x === prem) && newM.roles.cache.find(x => x === prem)){
            if(oldM.nickname != null){
                if(oldM.nickname.endsWith('★') && !newM.nickname.endsWith('★')){
                    newM.setNickname(oldM.nickname);
                }    
            }
            
        }
    });

   /* setInterval(function(){
        var date = new Date();
        date.setHours(date.getHours()+2);
        var heure = date.getHours();
        var minute = date.getMinutes();
        if(heure === 10){
            if(minute == 00){
                var actual = bot.msgs.actual;
                if(actual > length(bot.msgs)-1){
                    actual = 1;
                }
                var _message = bot.msgs[actual.toString()].text;
                var _author = bot.msgs[actual.toString()].author;
                bot.channels.cache.get("710089322111565874").send("*Idée du Jour n°"+actual+" proposée par* <@"+_author+">\n\n**"+_message+"**");
                bot.msgs ["actual"]= actual+1;
                fs.writeFile("./ressources/json/ideas.json", JSON.stringify(bot.msgs, null, 4), err =>{
                            if(err) throw err;
                         });
            }
        }
    }, 60000);*/

    async function execute(message, serverQueue) {
        if(message.content.startsWith('/p')){
            var args = message.content.slice(3);
        }
        else if(message.content.startsWith('/play')){
            var args = message.content.slice(6);
        }
    
        const voiceChannel = message.member.voice.channel;
    
        yts(args, async function(err, r){
            if(err) throw err;
    
            else if(!voiceChannel){
                return message.reply("vous devez être dans un salon vocal !");
            }
            else{
                const videos = r.videos;
                const song = {
                    title: videos[0].title,
                    url: videos[0].url,
                };
                var embed = new Discord.MessageEmbed()
                        .setTitle(videos[0].title)
                        .setFooter("Duration: "+videos[0].timestamp)
                        .setAuthor("Music asked by "+message.author.username, message.author.avatarURL)
                        .setImage("https://img.youtube.com/vi/"+videos[0].videoId+"/mqdefault.jpg")
                        .setDescription(videos[0].description);
                message.channel.send(embed);
                if (!serverQueue) {
                    const queueContruct = {
                        textChannel: message.channel,
                        voiceChannel: voiceChannel,
                        connection: null,
                        songs: [],
                        volume: 1,
                        playing: true,
                    };
            
                    queue.set(message.guild.id, queueContruct);
            
                    queueContruct.songs.push(song);
            
                    try {
                        voiceChannel.join().then(connection => {
                            queueContruct.connection = connection;
                            play(message.guild, queueContruct.songs[0]);
                        });
                        
                    } catch (err) {
                        console.log(err);
                        queue.delete(message.guild.id);
                        return message.channel.send(err);
                    }
                } else {
                    serverQueue.songs.push(song);
                    console.log(serverQueue.songs);
                    return message.channel.send(`${song.title} à été ajouté à la liste d'attente!`);
                }
            
            }
        })
    }

    async function skip(message, serverQueue) {
        if (!message.member.voice.channel) return message.channel.send('Vous devez être dans un salon vocal pour passer la chanson!');
        if (!serverQueue) return message.channel.send('Il n\'y a pas de chanson à passer zebi!');
        serverQueue.connection.dispatcher.end();
        message.channel.send('La musique à été passé par <@' + message.author.id + '>, prochaine lecture → `' + serverQueue.songs[0].title + '`');
    }

    async function stop(message, serverQueue) {
        if (!message.member.voice.channel) return message.channel.send('Vous devez être dans un salon vocal pour arreter la musique!');
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
        message.channel.send('La musique à été arrêté par <@' + message.author.id + '>');
    }

    async function pause(message, serverQueue) {
        if (!message.member.voice.channel) return message.channel.send('Vous devez être dans un salon vocal pour arreter la musique!');
        serverQueue.connection.dispatcher.pause();
        message.channel.send('La musique à été mis en pause par <@' + message.author.id + '>');
    }

    async function resume(message, serverQueue) {
        if (!message.member.voice.channel) return message.channel.send('Vous devez être dans un salon vocal pour arreter la musique!');
        serverQueue.connection.dispatcher.pause();
        message.channel.send('La musique à été mis relancé par <@' + message.author.id + '>');
    }
    
    async function play(guild, song) {
        const serverQueue = queue.get(guild.id);
        console.log(song.url);
        if (!song) {
            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);
            return;
        }
    
        const dispatcher = serverQueue.connection.play(await ytdl(song.url, {type : 'opus'}))
            .on('end', () => {
                serverQueue.songs.shift();
                play(guild, serverQueue.songs[0]);
            })
            .on('error', error => {
                console.log(error);
            });
        dispatcher.setVolume(serverQueue.volume);
    }

    async function record(voiceChannel, message) {
        voiceChannel.join().then(connection => {
            const audio = connection.receiver.createStream(message.author, { mode: 'pcm', end: 'manual' });
            audio.pipe(fs.createWriteStream("./ressources/sounds/"+message.author.id+".pcm"))
        })
    }

	function getUserFromMention(mention) {
		// The id is the first and only match found by the RegEx.
		const matches = mention.match(/^<@!?(\d+)>$/);

		// If supplied variable was not a mention, matches will be null instead of an array.
		if (!matches) return;

		// However the first element in the matches array will be the entire mention, not just the ID,
		// so use index 1.
		const id = matches[1];

		return client.users.cache.get(id);
	}

// Set bot token from config variable
bot.login(token);