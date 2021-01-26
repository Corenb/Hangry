module.exports = {
	name: 'reload',
	description: 'Reloads a command',
	guildOnly: true,
	permissions: 'ADMINISTRATOR',
	usage: '<command>',
	execute(message, args) {
		if (!args.length) return message.channel.send(`Vous n'avez précisé aucune commande à recharger, ${message.author}!`);

		const commandName = args[0].toLowerCase();
		const command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

		if (!command) return message.channel.send(`Il n'y a aucune commande de son nom ou cet alias \`${commandName}\`, ${message.author}!`);

		delete require.cache[require.resolve(`./${command.name}.js`)];

		try {
			const newCommand = require(`./${command.name}.js`);
			message.client.commands.set(newCommand.name, newCommand);
			message.channel.send(`Commande \`${command.name}\` rechargée avec succès!`);
		} catch (error) {
			console.error(error);
			message.channel.send(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``);
		}
	},
};