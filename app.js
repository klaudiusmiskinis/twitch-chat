const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const tmi = require('tmi.js');
const config = require('./config');
const port = process.env.PORT || config.port;

// Simple metrics to track usage
const metrics = {
    connections: 0,
    disconnections: 0,
    misuseEvents: 0,
    activeSockets: 0
};

function logEvent(message) {
    console.log(new Date().toISOString(), message);
}

app.use(express.static(__dirname + '/app'));

// Map to keep track of tmi clients, sockets and stored messages per channel
const channels = {};

function sendWatchers(channelName) {
    const channel = channels[channelName];
    if (!channel) return;
    io.to(channelName).emit('watchers', channel.sockets.size);
}

io.on('connection', (socket) => {
    metrics.connections++;
    metrics.activeSockets++;
    logEvent(`Conectado ${socket.id} desde ${socket.handshake.address}. Activas: ${metrics.activeSockets}`);

    socket.on('join', async (channelName) => {
        if (!channelName) {
            return;
        }

        // Leave previous channel if switching
        if (socket.channelName && socket.channelName !== channelName) {
            leaveChannel(socket, socket.channelName);
        }

        socket.channelName = channelName;
        logEvent(`${socket.id} se une al canal ${channelName}`);

        if (!channels[channelName]) {
            const client = new tmi.Client({
                channels: [channelName],
                connection: { reconnect: false }
            });
            channels[channelName] = { client, sockets: new Set(), messages: [] };

            client.on('message', (channel, tags, message, self) => {
                const mensaje = {
                    nombre: tags,
                    mensaje: message
                };
                const store = channels[channelName];
                if (store) {
                    store.messages.push({ usuario: tags.username, mensaje: message });
                    if (store.messages.length > 100) {
                        store.messages.shift();
                    }
                }
                io.to(channelName).emit('mensaje', mensaje);
            });

            try {
                await client.connect();
            } catch (err) {
                console.error('Failed to connect to Twitch:', err.message);
                return;
            }
        }

        channels[channelName].sockets.add(socket);
        socket.join(channelName);
        sendWatchers(channelName);
    });

    socket.on('bug', () => {
        metrics.misuseEvents++;
        logEvent(`Posible mal uso reportado por ${socket.id}. Total: ${metrics.misuseEvents}`);
    });

    socket.on('disconnect', () => {
        metrics.disconnections++;
        metrics.activeSockets--;
        logEvent(`Desconectado ${socket.id}. Activas: ${metrics.activeSockets}`);
        const channelName = socket.channelName;
        if (channelName) {
            leaveChannel(socket, channelName);
        }
    });
});

function leaveChannel(socket, channelName) {
    const channel = channels[channelName];
    if (!channel) return;
    channel.sockets.delete(socket);
    socket.leave(channelName);
    if (channel.sockets.size === 0) {
        channel.client.disconnect().catch((err) => {
            console.error('Error al desconectar:', err.message);
        });
        delete channels[channelName];
    } else {
        sendWatchers(channelName);
    }
}

// Expose metrics at /metrics
app.get('/metrics', (req, res) => {
    res.json(metrics);
});

// Provide stored messages in JSON format
app.get('/messages/:channel', (req, res) => {
    const channelName = req.params.channel;
    const channel = channels[channelName];
    if (!channel) {
        return res.status(404).json({ error: 'Canal no encontrado' });
    }
    res.json(channel.messages);
});

http.listen(port, () => {
    console.log('Servidor encendido en el puerto', `${port}`);
});
