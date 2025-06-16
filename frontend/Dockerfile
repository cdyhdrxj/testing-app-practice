FROM node:23-slim AS base
WORKDIR /code
COPY *.json .
RUN npm install

COPY *.mjs .
COPY *.ts .

FROM base AS dev
WORKDIR /code
CMD ["npm", "run", "dev"]
EXPOSE 3000
