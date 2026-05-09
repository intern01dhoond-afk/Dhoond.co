# Step 1: Build the Vite application
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# The API URL should be passed during build time or set via env
ARG VITE_API_URL
ARG VITE_RAZORPAY_KEY_ID
ARG VITE_GOOGLE_MAPS_API_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
# Remove local .env if it exists to ensure build args take precedence
RUN rm -f .env

RUN npm run build

# Step 2: Serve the static files with Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Add custom Nginx config to handle React Router (Single Page App)
RUN echo 'server { \
    listen 80; \
    include /etc/nginx/mime.types; \
    types { \
        video/mp4 mp4; \
    } \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
