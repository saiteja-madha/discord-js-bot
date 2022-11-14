FROM node:current-alpine3.15

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm start

COPY . .

EXPOSE 8080-8089 449

CMD [ "node", "bot.js" ]
