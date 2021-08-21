const axios = require("axios").default;
const ISO6391 = require("iso-639-1");
const sourcebin = require("sourcebin_js");

/**
 * @param {String} url
 */
async function getResponse(url) {
  try {
    const res = await axios.get(url);
    return {
      success: true,
      status: res.status,
      data: res.data,
    };
  } catch (error) {
    if (error.response?.status !== 404) {
      console.log(`[AXIOS ERROR]\nURL: ${url}\n${error}\n`);
    }
    return {
      success: false,
      status: error.response?.status,
      data: error.response?.data,
    };
  }
}

/**
 * @param {String} url
 */
async function downloadImage(url) {
  try {
    const res = await axios.get(url, {
      responseType: "stream",
    });
    return res.data;
  } catch (error) {
    console.log(`[AXIOS ERROR]\nURL: ${url}\n${error}\n`);
  }
}

/**
 * @param {String} input
 * @param {String} outputCode
 */
async function translate(input, outputCode) {
  try {
    const response = await axios.get(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${outputCode}&dt=t&q=${input}`
    );

    if (response && response?.status == 200) {
      return {
        input: response.data[0][0][1],
        output: response.data[0][0][0],
        inputCode: response.data[2],
        outputCode: outputCode,
        inputLang: ISO6391.getName(response.data[2]),
        outputLang: ISO6391.getName(outputCode),
      };
    }
  } catch (ex) {
    console.log(ex);
  }
}

async function postToBin(content, title) {
  try {
    let response = await sourcebin.create(
      [
        {
          name: " ",
          content,
          languageId: "text",
        },
      ],
      {
        title: title,
        description: " ",
      }
    );
    return response.url;
  } catch (ex) {
    console.log(ex);
  }
}

module.exports = {
  getResponse,
  downloadImage,
  translate,
  postToBin,
};
