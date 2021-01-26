const { prefix } = require('../config.json');

module.exports = {
	name: 'help',
	cooldown: 5,
	aliases: ['h', 'aide'],
	description: 'Affiche la liste des commandes ou une aide sur une commande spécifique.',
	usage: '<command>',
	execute(message, args) {
		const data = [];
		const { commands } = message.client;

		if (!args.length) {
			data.push('Voici la liste des commandes:');
			data.push(commands.map(command => command.name).join(', '));
			data.push(`\nFaites \`${prefix}help [command name]\` pour avoir plus d'information sur la commande!`);

			return message.author.send(data, { split: true }).then(() => {
				if (message.channel.type === 'dm') return;

				message.reply('Je vous ai envoyé un message privé avec la liste de mes commandes!');
			}).catch(error => {
				console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
				message.reply('Il semble que je ne peux vous envoyer de messages privés! Avez-vous vos messages privés d\'activé?');
			});
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return message.reply('Il ne s\'agit pas d\'une commande valide!');
		}

		data.push(`**Name:** ${command.name}`);

		if (command.aliases) data.push(`**Alias:** ${command.aliases.join(', ')}`);
		if (command.description) data.push(`**Description:** ${command.description}`);
		if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

		data.push(`**Cooldown:** ${command.cooldown || 3} seconde(s)`);

		message.channel.send(data, { split: true });
	},
};