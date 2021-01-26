// require the discord.js module
const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
'use strict';

const { name, prefix, token } = require('./config.json');

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

// create a new Discord client

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
	console.log('Ready!');
	client.user.setUsername(name);
	//client.user.setAvatar('./ressources/img/avatar.png');
    client.user.setActivity('Chamallow party !')
});

client.on('error', console.error);

client.on('message', message => {
    console.log((message.channel.type === 'dm' ? '' : '[' + message.channel.name + '] ') + message.author.tag + ' > ' + message.content);

	// Check if message don't start with command prefix or if author is a bot
	if (!message.content.startsWith(prefix) || message.author.bot) {
        const matches = message.content.match(/(c|s|Ç|ç|𝒄̧|\*)(a|𝒂|\*)+\s?(v|𝒗|\*)(a|𝒂|\*)+([\w|\W]+)?\?/i);

	    if (!matches) return;

        message.react("<:pascontent:769663569414455312>");

        client.user.setActivity(`manger ${message.author.username}`)
        return;
    }

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
});

// login to Discord with your app's token
client.login(token);