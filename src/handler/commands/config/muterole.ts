import { Command, ServerConfig } from '../../../interfaces';
import { configSchema as Schema } from '../../../schemas/configSchema';
import { parseRole } from '../../../util';

export const command: Command = {
    name: 'muterole',
    description: 'Set\'s the muted role for the server. These people can\'t talk when the mute command is run on them. Make sure the role has no perms to speak in all channels.',
    usage: 'modrole <set/remove> <role>',
    run: async (client, message, args) => {
        if (!message.member.permissions.has(['MANAGE_GUILD', 'MANAGE_ROLES'])) return;

        if (!args.length) {
            return message.reply('Please provide a valid option! \n\nValid options: `set`, `remove`');
        }

        await Schema.findOne({
            Guild: message.guild.id
        }, async (err: Error, data: ServerConfig) => {
            if (err) {
                throw err;
            }

            if (args[0]?.toLowerCase() === "set") {
                if (!args[1]) {
                    return message.reply('Please mention a role or role id!');
                }

                const role = parseRole(message.guild, args[1]);

                if (!role) {
                    return message.reply('I couldn\'t find the role specified!');
                }

                if (data) {
                    data.MutedRoleId = role.id;
                    data.save();
                    return message.channel.send(`The muted role has been set to **${role.name}**`);
                } else {
                    new Schema({
                        Guild: message.guild.id,
                        ModRoleId: role.id
                    }).save();
                    return message.channel.send(`The muted role has been set to **${role.name}**`);
                }
            } else if (args[0]?.toLowerCase() === "remove") {
                if (data) {
                    data.delete();
                    return message.channel.send(`The muted role has been removed successfully!`);
                } else {
                    return message.channel.send('The muted role is not setup for this server!');
                }
            }
        });
    }
}