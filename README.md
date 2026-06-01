# GymSaaS - Gestión para Gimnasios

Este es un sistema SaaS integral diseñado para optimizar la gestión operativa, control de accesos y retención de clientes en gimnasios. El proyecto está estructurado como un **Monorepo** utilizando **pnpm workspaces** para mejorar la eficiencia del almacenamiento y agilizar el desarrollo en equipo.

## Stack Tecnológico
- **Frontend (Admin & Cliente):** Next.js (JavaScript puro + CSS integrado, sin Tailwind).
- **Backend (API):** Node.js + Express.js (JavaScript puro).
- **Gestor de Paquetes:** pnpm.
- **Contenerización:** Docker & Docker Compose.

---

## Guía de Inicio Rápido (Con Docker) - RECOMENDADO

Para asegurar que todo el equipo trabaje exactamente en el mismo entorno de desarrollo (sin importar el sistema operativo), usamos Docker.

### Requisitos previos:
- Tener instalado y encendido.

### Pasos para levantar el proyecto:
1. Clona este repositorio en tu computadora.
2. Abre una terminal en la raíz del proyecto (`gymsaas`).
3. Ejecuta el siguiente comando para construir y encender los servidores por primera vez:
   ```bash
   docker compose up --build

Tener instalado Node.js (versión 18 o superior).

Tener instalado pnpm. Si no lo tienes, instálalo abriendo la terminal como administrador y corriendo:
npm install -g pnpm

Pasos para levantar el proyecto local:
Abre la terminal en la raíz del proyecto y descarga todas las dependencias del Workspace:

pnpm install
Si te aparece un error de bloqueo con la librería sharp de Next.js, aprueba los permisos ejecutando:


pnpm approve-builds
Enciende todas las aplicaciones (Admin, Cliente y Backend) al mismo tiempo con un solo comando:

pnpm dev
