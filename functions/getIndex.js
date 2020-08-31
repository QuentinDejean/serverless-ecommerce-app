const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const Mustache = require('mustache');
const axios = require('axios');
const { aws4Interceptor } = require("aws4-axios");

const restaurantsAPIRoot = process.env.RESTAURANT_API;
const region = process.env.REGION;

const interceptor = aws4Interceptor({
  region,
  service: "execute-api",
});

const httpClient = axios.create({
  baseURL: restaurantsAPIRoot,
});

httpClient.interceptors.request.use(interceptor);

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


let htmlTemplate;

const loadHtml = async () => {
  if (!htmlTemplate) {
    htmlTemplate = await fs.readFileAsync("static/index.html", "utf-8");
  }

  return htmlTemplate
}

const getRestaurants = async () => {
  const results = await httpClient.get("/restaurants");
  return results.data;
}

module.exports.handler = async event => {
  
  const template = await loadHtml();

  const restaurants = await getRestaurants();
  const dayOfWeek = days[new Date().getDay()];
  
  const html = Mustache.render(template, { dayOfWeek, restaurants });

  const response = {
    statusCode: 200,
    body: html,
    headers: {
      'Content-Type': 'text/html chatset=UTF-8'
    }
  }

  return response
};
