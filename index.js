String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};

const { CommandoClient, FriendlyError } = require('discord.js-commando');
const oneLine = require('common-tags').oneLine;

const token = 'FILL_ME';

const client = new CommandoClient({
  owner: 'FILL_ME',
});

client.registry.registerDefaultTypes();

// General
client
  .on('error', console.error)
  .on('warn', console.warn)
  .on('debug', console.log)
  .on('ready', () => {
    console.log(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
  })
  .on('disconnect', () => { console.warn('Disconnected!'); })
  .on('reconnecting', () => { console.warn('Reconnecting...'); });

// Commands
client
  .on('commandError', (cmd, err) => {
    if (err instanceof FriendlyError) return;
    console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
  })
  .on('commandBlocked', (msg, reason) => {
    console.log(oneLine`
			Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
			blocked; ${reason}
		`);
  })
  .on('commandPrefixChange', (guild, prefix) => {
    console.log(oneLine`
			Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
  })
  .on('commandStatusChange', (guild, command, enabled) => {
    console.log(oneLine`
			Command ${command.groupID}:${command.memberName}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
  });

// Groups
client
  .on('groupStatusChange', (guild, group, enabled) => {
    console.log(oneLine`
			Group ${group.id}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
  });

// Discord Events
client
  .on('presenceUpdate', async (oldPresence, newPresence) => {
    const { blacklist } = require('./blacklist');

    if (newPresence.user.bot) return;

    let oldActivity = null;
    if (oldPresence && oldPresence.activities.length !== 0)
      oldActivity = oldPresence.activities.filter(activity => activity.type === "PLAYING" && !blacklist.includes(activity.applicationID))[0];

    let newActivity = null;
    if (newPresence && newPresence.activities.length !== 0)
      newActivity = newPresence.activities.filter(activity => activity.type === "PLAYING" && !blacklist.includes(activity.applicationID))[0];

    if (!newActivity) {
      newPresence.member.roles.cache.map(role => {
        if (role.name === "@everyone") return;
        if (!role.name.startsWith("Playing ")) return;
        newPresence.member.roles.remove(role);
      });
      return;
    };

    // if (newActivity.applicationID == null) return;
    if (blacklist.includes(newActivity.applicationID)) return;

    const roleName = `Playing ${newActivity.name}`;
    console.log(`Running presenceUpdate for ${newActivity.applicationID}: ${roleName}.`);

    const userHasRole = newPresence.member.roles.cache.some(role => role.name === roleName);
    if (userHasRole) return;

    const guildHasRole = newPresence.guild.roles.cache.some(role => role.name === roleName);
    let activities = newPresence.guild.presences.cache.map(presence => presence.activities);
    activities = activities.flat().filter(Boolean);

    let addRole = null;
    if (!guildHasRole) {
      addRole = await newPresence.guild.roles.create({
        data: {
          name: roleName,
          hoist: true,
          mentionable: true,
        },
        reason: 'Automatic RoleBot update: new role detected.',
      });
    } else {
      addRole = newPresence.guild.roles.cache.find(role => role.name === roleName);
    }

    addRole.setPosition(50, {
      relative: true,
      reason: "Automatic RoleBot update: bumping order."
    });

    newPresence.member.roles.cache.map(role => {
      if (role.name === "@everyone") return;
      if (!role.name.startsWith("Playing ")) return;
      newPresence.member.roles.remove(role);
    });

    newPresence.member.roles.add(addRole);

    newPresence.guild.roles.cache.filter(role => role.members.size < 1).map(role => {
      if (role.name === "@everyone") return;
      if (role.name === roleName) return;
      if (!role.name.startsWith("Playing ")) return;
      role.delete("Automatic RoleBot update: no users in role, deleting.");
    });
  });

client.login(token);