const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

let htmlTemplate;

const loadHtml = async () => {
  if (!htmlTemplate) {
    htmlTemplate = await fs.readFileAsync("static/index.html", "utf-8");
  }

  return htmlTemplate
}

module.exports.handler = async event => {
  const html = await loadHtml();

  const response = {
    statusCode: 200,
    body: html,
    headers: {
      'Content-Type': 'text/html chatset=UTF-8'
    }
  }

  return response
};
