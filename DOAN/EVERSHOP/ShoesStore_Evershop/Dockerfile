FROM node:20-alpine

WORKDIR /app

RUN npm install -g npm@9

COPY package*.json .
COPY packages ./packages
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

CMD ["sh", "-c", "for i in {1..30}; do echo \"Waiting for database... (attempt $i/30)\"; sleep 1; done && printf '%s\\n' \"${DB_HOST}\" \"${DB_PORT}\" \"${DB_USER}\" \"${DB_PASSWORD}\" \"${DB_NAME}\" \"\" | npm run setup && npm run start"]
