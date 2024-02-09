FROM node:18-alpine AS base

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN apk --no-cache add curl

RUN npm install -g @nestjs/cli

WORKDIR /usr/src/

COPY package.json package-lock.json ./

RUN npm install --include=dev

COPY ./src ./src
COPY ./nest-cli.json ./
COPY ./tsconfig.build.json ./
COPY ./tsconfig.json ./

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]

FROM base AS development

EXPOSE 9229

CMD ["nest", "start", "--debug", "0.0.0.0:9229", "--watch"]

FROM node:18-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=base --chown=1000:1000 /usr/src/package.json /usr/src/package-lock.json /usr/src/
COPY --from=base --chown=1000:1000 /usr/src/dist /usr/src/dist

WORKDIR /usr/src/

RUN npm ci --omit=dev && npm cache clean --force

WORKDIR /usr/src/dist

USER 1000

EXPOSE 3000 5000

CMD ["node", "main.js"]