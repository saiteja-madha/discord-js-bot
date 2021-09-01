const { Command } = require("@src/structures");
const { MessageEmbed } = require("discord.js");

module.exports = class Eval extends Command {
  constructor(client) {
    super(client, {
      name: "eval",
      description: "evaluates something",
      command: {
        enabled: true,
        usage: "1+1",
        minArgsCount: 1,
        category: "OWNER",
        botOwnerOnly: true,
        botPermissions: ['EMBED_LINKS']
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "input",
            description: "content to eval",
            type: "STRING",
            required: true,
          },
        ],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {

        const input = args.join(' ');
        if (!input) return message.reply('Please provide code to eval');
        if(!input.toLowerCase().includes('token')) {
    
          const embed = new MessageEmbed();
    
          try {
            let output = eval(input);
            if (typeof output !== 'string') output = require('util').inspect(output, { depth: 0 });
            
            embed
              .addField('📥 Input', `\`\`\`js\n${input.length > 1024 ? 'Too large to display.' : input}\`\`\``)
              .addField('📤 Output', `\`\`\`js\n${output.length > 1024 ? 'Too large to display.' : output}\`\`\``)
              .setColor('RANDOM');
    
          } catch(err) {
            embed
              .addField('📥 Input', `\`\`\`js\n${input.length > 1024 ? 'Too large to display.' : input}\`\`\``)
              .addField('📤 Output', `\`\`\`js\n${err.length > 1024 ? 'Too large to display.' : err}\`\`\``)
              .setColor('ORANGE');
          }
    
          message.channel.send({embeds: [embed]});
    
        } else {
          message.channel.send('my token: ||screw you||');
        }
      }
    };
