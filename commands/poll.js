module.exports = {
	name: 'poll',
	cooldown: 5,
	aliases: ['polls', 'sondage'],
	description: 'Génère un sondage à plusieurs choix.',
	args: true,
	usage: '<question> "<choice1>" "<choice2>"',
	execute(message, args) {
			if (!args.length) {
                return message.channel.send("Utilisation de la commande: `" + prefix + "poll titre;choix 1$emoji;choix 2$emoji;...`")
            } else {
                var args = message.content.slice(6);
                args = args.split(";");
                if (args.length < 3) {
                    return message.channel.send("Merci de rentrer au moins 2 choix !")
                } else {
                    var len = args.length;
                    var embed = new Discord.MessageEmbed()
                        .setTitle(args[0])
                        .setFooter("Réagissez selon votre choix !")
                        .setColor([255,0,0])
                        .setAuthor("Sondage par " + message.author.username, message.author.avatarURL());

                    for (let i = 1; i < len; i++) {
                        var choice = args[i].split('$');
                        embed.addField("----", choice[1]+" : "+choice[0])
                    }

                    message.channel.send(embed).then(sent => {
                                                                bot.polls [sent.id] = {
                                                                                    title: args[0],
                                                                                    author: message.author.username
                                                                                    }
                                                                fs.writeFile("./ressources/json/polls.json", JSON.stringify(bot.polls, null, 4), err =>{
                                                                                                                                            if(err) throw err;
                                                                                                                                        });
                                                                for(let i = 1; i < len; i++){
                                                                var choice = args[i].split('$');
                                                                sent.react(choice[1]);
                                                                }
                                                                
                                                             });

                message.delete()
            }
        }
	},
};