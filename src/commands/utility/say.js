const { Message, MessageEmbed } = require('discord.js')
const { Command } = require("@src/structures");

module.exports = class Say extends Command {
    constructor(client) {
        super(client, {
            name: "say",
            description: "say something",
            command: {
                enabled: true,
                usage: "Say what?!",
                category: "UTILITY",
                botPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
            },
        })
    }
    /**
     * @param {Message} message 
     * @param {string[]} args 
     */

    async messageRun(message, args) {
        let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
        if(channel) {
            args.shift();
        }
        
        if(
            message.content.indexOf("@everyone") > -1 ||
            message.content.indexOf("@here") > -1
        ) {
            const embeded = new MessageEmbed()
                    .setDescription("To tag here or everyone has been disabled!!")
                    .setColor("RED")
            return message.reply({ embeds: [embeded] })
        } else channel = message.channel;

        // Check type and viewble
        const msg = message.content.slice(message.content.indexOf(args[0]), message.content.length);
        message.channel.send(msg, {
            name: `${message.author.username}`,
            icon: `${message.author.displayAvatarURL()}`
        }).catch(()=>{})
    }
};
