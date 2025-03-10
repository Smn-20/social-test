#  Create a new image from the base nodejs 7 image.
FROM node:16.13.2 as node
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --no-optional
COPY . .
RUN npm run build

##### Stage 2
FROM nginx:alpine
VOLUME /var/cache/nginx
EXPOSE 80
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=node /app/dist/sris-ui /usr/share/nginx/html
