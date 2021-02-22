module.exports = {
	name: 'clear',
	aliases: ['purge'],
	description: 'Reloads a command',
	guildOnly: true,
	args: true,
	permissions: 'MANAGE_MESSAGES',
	usage: '<amount>',
	execute(message, args) {
		const amount = parseInt(args[0]) + 1;

		if (isNaN(amount) || amount <= 1 || amount > 100) {
			return 'veuillez saisir un nombre en 0 et 100.';
		}

		message.channel.bulkDelete(amount, true).catch(err => {
			console.error(err);
			return 'une erreur est survenue lors de la suppression des messages dans ce canal !';
		});
	},
};