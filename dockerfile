FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --production

COPY . .

EXPOSE 8080 / 8089
EXPOSED 449

CMD [ "node", "bot.js" ]
