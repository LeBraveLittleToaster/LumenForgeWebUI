FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package.json /app/
RUN npm install

FROM node:20-alpine AS build-env
WORKDIR /app
COPY . /app/
COPY --from=dependencies /app/node_modules /app/node_modules
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package.json /app/
COPY --from=dependencies /app/node_modules /app/node_modules
COPY --from=build-env /app/dist/lumenforge-webui /app/dist/lumenforge-webui
CMD ["npm", "run", "start"]
