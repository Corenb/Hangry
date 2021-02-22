module.export = {
	name: 'message',
	aliases: ['m', 'msg'],
	description: 'Envoi un message dans un canal.',
	guildOnly: true,
	args: true,
	permissions: 'MANAGE_MESSAGES',
	usage: '<canal> <message>',
	execute(message, args) {
		if (args.length < 2) {
			return 'Veuillez mentionner le canal sur lequel envoyer le message et indiquer un message.';
		}

		const taggedChannel = bot.getChannelFromMention(args[0]);
		if (!taggedChannel) {
			return 'Veuillez mentionner le canal à l\'aide de la fonction mention.';
		}

		const msg = args.slice(1).join(' ');
		return taggedChannel.send(msg, { split: true }).then(() => {
			return `J'ai envoyé le message sur le canal **${taggedChannel.tag}**!`;
		}).catch(error => {
			console.error(`Could not send message on ${taggedChannel.tag}.\n`, error);
			return `Il semble que je ne peux envoyer de message sur **${taggedChannel.tag}** !`;
		});
	},
}