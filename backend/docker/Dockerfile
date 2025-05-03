FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY .. .

EXPOSE 5000

CMD ["npm", "run", "dev"]  # O el comando que uses para iniciar tu servidor