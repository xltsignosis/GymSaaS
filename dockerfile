FROM node:20-alpine

# Instalar pnpm globalmente de forma segura
RUN npm install -g pnpm

WORKDIR /app

# Copiar los archivos de configuración del monorepo
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./

# Copiar los package.json de todas las aplicaciones para instalar dependencias primero (aprovecha la cache)
COPY apps/admin-dashboard/package.json ./apps/admin-dashboard/
COPY apps/client-webapp/package.json ./apps/client-webapp/
COPY packages/apis-backend/package.json ./packages/apis-backend/

# Instalar todas las dependencias del workspace
RUN pnpm install

# Copiar el resto del código del proyecto
COPY . .

# Exponer los puertos de las 3 aplicaciones
# 3000: Admin, 3001: Client, 5000: Backend (puedes ajustarlos si usas otros)
EXPOSE 3000 3001 5000

# Comando por defecto para correr todo en desarrollo
CMD ["pnpm", "dev"]