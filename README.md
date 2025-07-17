# Visualizador de Chat de Twitch

Aplicación en Node.js que se conecta a un canal de Twitch y muestra sus mensajes en tiempo real a través de una interfaz web. Además permite un pequeño chat privado entre espectadores.

## Requisitos

- Node.js 20.x
- npm

## Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone <url>
cd twitch-chat
npm install
```

## Configuración

Los valores por defecto se encuentran en `config.js`:

- `port` – puerto del servidor HTTP (por defecto 3000)
- `channel` – canal de Twitch al que conectarse (por defecto `illojuan`)

Puedes sobrescribirlos con las variables de entorno `PORT` y `TWITCH_CHANNEL`.

Ejemplo:

```bash
PORT=4000 TWITCH_CHANNEL=midirecto npm start
```

## Puesta en marcha

Arranca el servidor normalmente con:

```bash
npm start
```

Durante el desarrollo utiliza `nodemon` para recarga automática:

```bash
npm run dev
```

Una vez iniciado el servidor visita `http://localhost:<port>/` para acceder a la interfaz.

## Endpoints

- `/metrics` – muestra métricas de conexiones, desconexiones y eventos de mal uso.
- `/messages/<canal>` – devuelve en formato JSON las últimas 100 publicaciones públicas almacenadas para el canal indicado.

## Licencia

MIT
