FROM node:4-onbuild
ADD . /app
WORKDIR /app
RUN npm install
