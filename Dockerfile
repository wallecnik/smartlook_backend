FROM node:14.16.0

WORKDIR /home/node/app
COPY . .
RUN npm ci
RUN npm run build

EXPOSE 3000

CMD [ "node", "dist/app.js" ]
