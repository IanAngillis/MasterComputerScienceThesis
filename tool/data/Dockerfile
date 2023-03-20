# syntax=docker/dockerfile:1
   
FROM node:18-alpine
WORKDIR /app
COPY x.json y.json
RUN yarn install --production
CMD ["node", "src/index.js"]
EXPOSE 3000