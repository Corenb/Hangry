module.exports = {
	name: 'message',
	aliases: ['m', 'msg'],
	description: 'Envoi un message dans un canal.',
	guildOnly: true,
	permissions: 'MANAGE_MESSAGES',
	usage: '<canal> <message>',
	execute(message, args) {
		if (args.length < 2) {
			return message.reply('Veuillez mentionner le canal sur lequel envoyer le message et indiquer un message.');
		}

		const taggedUser = message.mentions.users.first();
		if (!taggedUser) {
			return message.reply('Veuillez mentionner l\'utilisateur à l\'aide de la fonction mention.');
		}

		const msg = args.slice(1).join(' ');
		return taggedUser.send(msg, { split: true }).then(() => {
			if (message.channel.type === 'dm') return;

			message.reply(`J'ai envoyé le message en privé à **${taggedUser.tag}**!`);
		}).catch(error => {
			console.error(`Could not send help DM to ${taggedUser.tag}.\n`, error);
			message.reply(`Il semble que je ne peux envoyer à **${taggedUser.tag}** de messages privés!`);
		});

		return message.channel.send(`Le message a été envoyé à **${taggedUser.tag}**!`);
	},
};