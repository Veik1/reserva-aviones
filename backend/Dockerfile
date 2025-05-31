FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . .

ENV NODE_ENV=production

EXPOSE 5000

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["npm", "start"]