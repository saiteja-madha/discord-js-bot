FROM node:current-alpine3.15

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm start

COPY . .

EXPOSE 8080 8081 8082 8083 8084 8085 8087 8088 8089 449 

CMD [ "node", "bot.js" ]
