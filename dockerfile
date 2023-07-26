# Base image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Bundle rest of the source code
COPY . .

# Environment variables
ENV BOT_TOKEN=
ENV MONGO_CONNECTION=
ENV ERROR_LOGS=
ENV JOIN_LEAVE_LOGS=
ENV BOT_SECRET=
ENV SESSION_PASSWORD=
ENV WEATHERSTACK_KEY=
ENV STRANGE_API_KEY=
ENV SPOTIFY_CLIENT_ID=
ENV SPOTIFY_CLIENT_SECRET=

# Expose port 8080 for dashboard
EXPOSE 8080

# Define the command to run your Node.js application
CMD [ "node", "bot.js" ]
