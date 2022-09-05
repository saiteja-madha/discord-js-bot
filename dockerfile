FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --production

COPY . .

EXPOSE 8080

CMD [ "node", "bot.js" ]