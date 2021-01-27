module.exports = {
	name: 'clear',
	aliases: ['purge'],
	description: 'Reloads a command',
	guildOnly: true,
	args: true,
	permissions: 'MANAGE_MESSAGES',
	usage: '<amount>',
	execute(message, args) {
		const amount = args.join(' ');

        if (message.deletable) {
            message.delete();
        }

        if (!message.member.hasPermission("MANAGE_MESSAGES")) {
            return message.reply("Vous n'avez pas l'autorisation de faire ça...").then(m => m.delete(5000));
        }

        if (isNaN(amount) || parseInt(amount) <= 0) {
            return message.reply("Met un nombre > 0 et pas de lettres").then(m => m.delete(5000));
        }

        if (!message.guild.me.hasPermission("MANAGE_MESSAGES")) {
            return message.reply("Il me manque des permissions !").then(m => m.delete(5000));
        }

        let deleteAmount = parseInt(amount) + 1;

        if (deleteAmount > 100) {
            deleteAmount = 100;
        }

        message.channel.bulkDelete(deleteAmount, true)
            .then(deleted => message.channel.send(` \`${deleted.size}\` messages ont été supprimés.`))
            .catch(err => message.reply(`Oups... ${err}`));
	},
};