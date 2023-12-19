FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . ./apps/api/
EXPOSE 9074
CMD [ "node", "main.js" ]