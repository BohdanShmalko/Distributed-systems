FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY ./ ./
EXPOSE 9074
CMD [ "node", "./apps/handler/main.js" ]