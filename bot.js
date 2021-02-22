'use strict';

// Require the fs module
const fs = require('fs');
const request = require('request');

// Require the discord.js module
const Discord = require('discord.js');

// Create a new Discord client
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

const { production, name, prefix, token, deleteCommand, disboard } = require('./ressources/config.json');
const { activities_list } = require('./ressources/messages.json');

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

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
	console.log(`Client is logged in as ${client.user.tag} and ready!`);
	client.user.setUsername(name);
	if (production)	client.user.setAvatar('./ressources/img/avatar.png');
    setInterval(() => {
        const index = Math.floor(Math.random() * (activities_list.length - 1) + 1); // generates a random number between 1 and the length of the activities array list (in this case 5).
        client.usersetPresence({ activity: { name: `<${activities_list[index]}>` }, status: 'online' }); //.setActivity(activities_list[index]); // sets bot's activities to one of the phrases in the arraylist.
    }, 3600000); // Runs this every 10 seconds.
});

client.on('error', console.error);

client.on('messageUpdate', function(oldMessage, newMessage){
	if (matchBannedWords(newMessage.content)) reactBannedWords(newMessage);

	if (matchBannedWords(oldMessage.content))	oldMessage.reactions.resolve('<:pascontent:769663569414455312>').users.remove(client.user);
});

client.on('message', message => {
	if (message.author.bot) return;

    console.log((message.channel.type === 'dm' ? '' : '[' + message.channel.name + '] ') + message.author.tag + ' > ' + message.content);

	const args = message.content.trim().split(/ +/);

	// Check if message don't start with command prefix or if author is a bot
	if (!args[0].startsWith(prefix)) {
		if (args.length > 1 && args[0].includes(client.user.id) && !(message.content.includes("@here") || message.content.includes("@everyone"))) {
			// strip off 'gif' from the message and that'll be the search term
			var term = args.slice(1).join('+');
			term = encodeURI(term)

			// make a request to giphy with the search term
			// we can also set the raiting 
			request(`http://api.giphy.com/v1/gifs/search?q=chien+${term}&rating=r&api_key=dc6zaTOxFJmzC&limit=10&lang=fr`, function (error, response, body) {
			if (!error && response.statusCode == 200) {

				const content =  JSON.parse(body)

				// giphy returns several results so we can grab a random result by generating a random index
				// random number between 0 and 10
				const item = Math.floor(Math.random() * 10)

				return message.channel.send(content.data[item].images.fixed_height.url);
			}
			})
		}
		
		const matches = message.content.match(/(c|s|Ç|ç|𝒄̧|\*)(a|𝒂|\*)+\s?(v|𝒗|\*)(a|𝒂|\*)+([\w|\W]+)?\?/i);
		console.log(matches);
2577
		if (matchBannedWords(message.content))	reactBannedWords(message);
	} else {
		args.slice(prefix.length);
		const commandName = args.shift().toLowerCase();
	
		// Get command through his name or aliases
		const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
	
		// Check if command exist
		if (!command) return;
	
		// Check if command is guild only and if the channel is guild or DM
		if (command.guildOnly && message.channel.type === 'dm') {
			return reply(message, 'Je ne peux exécuter cette commande en message privé !');
		}
	
		if (command.permissions) {
			const authorPerms = message.channel.permissionsFor(message.author);
	
			if (!authorPerms || !authorPerms.has(command.permissions)) {
				return reply(message, 'Vous n\'avez pas la permission d\'exécuter cette commande !');
			}
		}
	
		// Check if command has arguments
		if (command.args && !args.length) {
			let replyMessage = `Arguments manquants, ${message.author}!`;
	
			// Check if command has usage configured and send it
			if (command.usage) {
				replyMessage += `\nVeuillez utiliser: ${prefix}${commandName} ${command.usage}`;
			}
	
			return reply(message, replyMessage);
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
				return reply(message, `Veuillez attendre ${timeLeft.toFixed(1)} seconde(s) avant d'utiliser la commande \`${command.name}\` .`);
			}
	
			timestamps.set(message.author.id, now);
			setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
		}
	
		// Try to execute command
		try {
			const result = command.execute(message, args);
			return reply(message, result);
		} catch (error) {
			console.error(error);
			return reply(message, `Erreur lors de l'exécution de cette commande!`);
		}
	}
});

client.on('messageReactionAdd', async (reaction, user) => {

});

function matchBannedWords(message) {
	return message.match(/(c|s|𝕤|Ç|ç|𝒄̧|ć|č|𝕔|\*)(a|𝒂|ã|à|𝕒|\*)+\s?(v|𝒗|𝕧|\*)(a|𝒂|ã|à|𝕒|\*)+([\w|\W]{0, 10}+)?\?/i);
}

function reactBannedWords(message){
	message.react('<:pascontent:769663569414455312>');
	client.user.setPresence({ activity: { name: `manger ${message.author.username}`, type: 'PLAYING' }, status: 'idle' });
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

function getChannelFromMention(mention) {
	// The id is the first and only match found by the RegEx.
	const matches = mention.match(/^<#!?(\d+)>$/);

	// If supplied variable was not a mention, matches will be null instead of an array.
	if (!matches) return;

	// However the first element in the matches array will be the entire mention, not just the ID,
	// so use index 1.
	const id = matches[1];

	return client.channels.cache.get(id);
}

async function reply(message, reply) {
	try {
        if (reply) {
            message.channel.send(reply).then(sentMessage => sentMessage.delete({ timeout: deleteCommand }));
        }

        message.delete({ timeout: deleteCommand });
	} catch (error) {
		console.log(error);
	}
}

// Login to Discord with your app's token
client.login(token);