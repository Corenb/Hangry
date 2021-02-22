module.exports = {
	name: 'kick',
	description: 'Kick a user from the server.',
	guildOnly: true,
	args: true,
	permissions: 'KICK_MEMBERS',
	usage: '<user>',
	execute(message, args) {
		if (!message.mentions.users.size) {
			return message.reply('vous devez mentionner un utilisateur pour l\'expulser !');
		}

		const taggedUser = message.mentions.users.first();

		message.channel.send(`${taggedUser.username} a été expulsé`);
	},
};