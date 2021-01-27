module.exports = {
	name: 'message',
	aliases: ['m', 'msg'],
	description: 'Envoi un message dans un canal.',
	guildOnly: true,
	args: true,
	permissions: 'MANAGE_MESSAGES',
	usage: '<canal> <message>',
	execute(message, args) {
		if (args.length < 2) {
			return message.reply('Veuillez mentionner le canal sur lequel envoyer le message et indiquer un message.');
		}

		const taggedChannel = message.mentions.channel.first();
		if (!taggedChannel) {
			return message.reply('Veuillez mentionner le canal à l\'aide de la fonction mention.');
		}

		const msg = args.slice(1).join(' ');
		return taggedChannel.send(msg, { split: true }).then(() => {
			message.reply(`J'ai envoyé le message sur le canal **${taggedChannel.tag}**!`);
		}).catch(error => {
			console.error(`Could not send message on ${taggedChannel.tag}.\n`, error);
			message.reply(`Il semble que je ne peux envoyer de message sur **${taggedChannel.tag}** !`);
		});
	},
};