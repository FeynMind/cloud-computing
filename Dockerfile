FROM node:18.20.5
WORKDIR /app
ENV JWT_SECRET 'hD9v0QmLfEz+f+eJk9UgtzLOR3P9A1hb1e6kdydLPQ8'
ENV GCS_BUCKET_NAME 'feynmind-model'
COPY . .
RUN npm install
EXPOSE 9000
CMD [ "npm", "run", "start"]