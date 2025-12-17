FROM node:20-alpine

WORKDIR /app

RUN npm install -g npm@9

COPY package*.json .
COPY packages ./packages
COPY themes ./themes
COPY extensions ./extensions
COPY public ./public
COPY media ./media
COPY config ./config
COPY translations ./translations
COPY seed ./seed

RUN npm install
RUN npm run compile
RUN npm run compile:db
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
