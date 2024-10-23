const ISO6391 = require('iso-639-1')
const sourcebin = require('sourcebin_js')
const { error, debug } = require('@helpers/Logger')
const fetch = require('node-fetch')

module.exports = class HttpUtils {
  /**
   * Returns JSON response from url
   * @param {string} url
   * @param {object} options
   */
  static async getJson(url, options) {
    try {
      // with auth
      const response = options ? await fetch(url, options) : await fetch(url)
      const json = await response.json()
      return {
        success: response.status === 200 ? true : false,
        status: response.status,
        data: json,
      }
    } catch (ex) {
      debug(`Url: ${url}`)
      error(`getJson`, ex)
      return {
        success: false,
      }
    }
  }

  /**
   * Returns buffer from url
   * @param {string} url
   * @param {object} options
   */
  static async getBuffer(url, options) {
    try {
      const response = options ? await fetch(url, options) : await fetch(url)
      const buffer = await response.buffer()
      if (response.status !== 200) debug(response)
      return {
        success: response.status === 200 ? true : false,
        status: response.status,
        buffer,
      }
    } catch (ex) {
      debug(`Url: ${url}`)
      error(`getBuffer`, ex)
      return {
        success: false,
      }
    }
  }

  /**
   * Posts the provided content to the BIN
   * @param {string} content
   * @param {string} title
   */
  static async postToBin(content, title) {
    try {
      const response = await sourcebin.create(
        [
          {
            name: ' ',
            content,
            languageId: 'text',
          },
        ],
        {
          title,
          description: ' ',
        }
      )
      return {
        url: response.url,
        short: response.short,
        raw: `https://cdn.sourceb.in/bins/${response.key}/0`,
      }
    } catch (ex) {
      error(`postToBin`, ex)
    }
  }
}
