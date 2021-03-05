FROM node:14.4.0 AS build

COPY . .
RUN npm ci && npm run build

FROM node:slim-14.4.0

USER node
EXPOSE 8080

COPY --from=build /home/node/app/dist /home/node/app/package.json /home/node/app/package-lock.json ./
RUN npm ci --production

CMD [ "node", "dist/app.js" ]

#FROM node:14.4.0
#
#WORKDIR /home/node/app
#EXPOSE 8080
#
#COPY --chown=node:node . .
#RUN npm install && npm build
#
#USER node
#
#CMD [ "node", "dist/app.js" ]