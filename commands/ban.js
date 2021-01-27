module.exports = {
	name: 'ban',
	description: 'Ban a user from the server.',
	guildOnly: true,
	args: true,
	permissions: 'KICK_MEMBERS',
	usage: '<user> <reason>',
	execute(message, args) {
		/*if (args.length < 2) {
			return message.reply('Veuillez mentionner l\'utilisateur à bannir et indiquer une raison.');
		}

		const taggedUser = message.mentions.users.first();
		if (!taggedUser) {
			return message.reply('Veuillez mentionner l\'utilisateur à l\'aide de la fonction mention.');
		}

		const reason = args.slice(1).join(' ');
		try {
			await message.guild.members.ban(taggedUser, { reason });
		} catch (error) {
			return message.channel.send(`Impossible de bannir **${taggedUser.tag}**: ${error}`);
		}

		return message.channel.send(`L'utilisateur **${taggedUser.tag}** a été banni du serveur!`);*/
	},
};