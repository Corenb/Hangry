module.exports = {
	name: 'kick',
	description: 'Kick a user from the server.',
	guildOnly: true,
	args: true,
	permissions: 'KICK_MEMBERS',
	usage: '<user>',
	execute(message, args) {
		const taggedUser = message.mentions.users.first();
	},
};