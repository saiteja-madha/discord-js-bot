const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

// This dummy token will be replaced by the actual token
const DUMMY_TOKEN = "MY_TOKEN_IS_SECRET";

/**
 * @type {import("@structures/Command")}
 */
/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "eval",
    description: "evaluates something",
    category: "OWNER",
    botPermissions: ["EmbedLinks"],
    command: {
        enabled: true,
        usage: "<script>",
        minArgsCount: 1,
    },
    slashCommand: {
        enabled: false,
        options: [{
            name: "expression",
            description: "content to evaluate",
            type: ApplicationCommandOptionType.String,
            required: true,
        }, ],
    },

    async messageRun(message, args) {
        const input = args.join(" ");

        if (!input) return message.safeReply("Please provide code to eval");

        let response;
        try {
            const output = evaluate(input);
            response = buildSuccessResponse(output, message.client);
        } catch (ex) {
            response = buildErrorResponse(ex);
        }
        await message.safeReply(response);
    },

    async interactionRun(interaction) {
        await interaction.deferReply();
        const input = interaction.options.getString("expression");

        let response;
        try {
            const output = evaluate(input);
            response = buildSuccessResponse(output, interaction.client);
        } catch (ex) {
            response = buildErrorResponse(ex);
        }
        await interaction.editReply(response);
    },
};

const evaluate = async (input) => {
    try {
        // Evaluate (execute) our input
        const evaled = eval("(async () => {" + input + "})()");
        return evaled;

    } catch (err) {
        // Return error
        return err;
    }

}

const buildSuccessResponse = async (output, client) => {

    // This function cleans up and prepares the
    // result of our eval command input for sending
    // to the channel

    const clean = async (text) => {

        // If our input is a promise, await it before continuing
        if (text && text.constructor.name == "Promise")
            text = await text;

        // If the response isn't a string, `util.inspect()`
        // is used to 'stringify' the code in a safe way that
        // won't error out on objects with circular references
        // (like Collections, for example)
        if (typeof text !== "string")
            text = require("util").inspect(text, {
                depth: 1
            });

        // Token protection
        text = require("util").inspect(text, {
            depth: 0
        }).replaceAll(client.token, DUMMY_TOKEN);

        // Replace symbols with character code alternatives
        text = text
            .replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203));

        // Send off the cleaned up result
        return text;
    }

    output = await clean(output);

    const embed = new EmbedBuilder()
        .setAuthor({ name: "📤 Output" })
        .setDescription("```js\n" + (output.length > 4096 ? `${output.substr(0, 4000)}...` : output) + "\n```")
        .setColor("Random")
        .setTimestamp(Date.now());

    return {
        embeds: [embed]
    };
};

const buildErrorResponse = (err) => {
    const embed = new EmbedBuilder();
    embed
        .setAuthor({ name: "📤 Error" })
        .setDescription("```js\n" + (err.length > 4096 ? `${err.substr(0, 4000)}...` : err) + "\n```")
        .setColor(EMBED_COLORS.ERROR)
        .setTimestamp(Date.now());

    return {
        embeds: [embed]
    };
};
