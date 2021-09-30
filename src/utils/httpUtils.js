const ISO6391 = require("iso-639-1");
const sourcebin = require("sourcebin_js");
const { error, debug } = require("@src/helpers/logger");
const fetch = require("node-fetch");
const gTranslate = require("@vitalets/google-translate-api");

async function getJson(url) {
  try {
    const response = await fetch(url);
    const json = await response.json();
    return {
      success: response.status === 200 ? true : false,
      status: response.status,
      data: json,
    };
  } catch (ex) {
    debug(`Url: ${url}`);
    error(`getJson`, ex);
    return {
      success: false,
    };
  }
}

async function getBuffer(url) {
  try {
    const response = await fetch(url);
    const buffer = await response.buffer();
    return {
      success: response.status === 200 ? true : false,
      status: response.status,
      buffer,
    };
  } catch (ex) {
    debug(`Url: ${url}`);
    error(`getBuffer`, ex);
    return {
      success: false,
    };
  }
}

async function translate(content, outputCode) {
  try {
    const response = await gTranslate(content, { to: outputCode });
    return {
      input: response.from.text.value,
      output: response.text,
      inputCode: response.from.language.iso,
      outputCode,
      inputLang: ISO6391.getName(response.from.language.iso),
      outputLang: ISO6391.getName(outputCode),
    };
  } catch (ex) {
    error("translate", ex);
    debug(`Content - ${content} OutputCode: ${outputCode}`);
  }
}

async function postToBin(content, title) {
  try {
    const response = await sourcebin.create(
      [
        {
          name: " ",
          content,
          languageId: "text",
        },
      ],
      {
        title,
        description: " ",
      }
    );
    return {
      url: response.url,
      short: response.short,
      raw: `https://cdn.sourceb.in/bins/${response.key}/0`,
    };
  } catch (ex) {
    error(`postToBin`, ex);
  }
}

module.exports = {
  translate,
  postToBin,
  getJson,
  getBuffer,
};
