# Dockerfile para app Node.js + MariaDB
FROM node:20

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el resto del código
COPY . .

# Exponer el puerto de la app
EXPOSE 3000

# Comando por defecto
CMD ["npm", "run", "start"]
