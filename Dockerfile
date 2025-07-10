# Étape 1 : build Angular
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# Étape 2 : serveur NGINX
FROM nginx:alpine

# Copier directement le contenu de dist (pas de sous-dossier)
COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf
