FROM node:16.15

RUN mkdir -p /usr/src/app && chown -R node:node /usr/src/app
USER node
WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma/

RUN npm install
# RUN npm ci --only=production && npm cache clean --force

COPY --chown=node:node . .

RUN npm run build

EXPOSE 8080

CMD [ "npx", "nest", "start" ]

# https://www.tomray.dev/nestjs-docker-production