const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const tmi = require('tmi.js');
const config = require('./config');
const port = process.env.PORT || config.port;

app.use(express.static(__dirname + '/app'));

// Map to keep track of tmi clients and sockets per channel
const channels = {};

io.on('connection', (socket) => {
    console.log('Conectado');

    socket.on('join', async (channelName) => {
        if (!channelName) {
            return;
        }

        // Leave previous channel if switching
        if (socket.channelName && socket.channelName !== channelName) {
            leaveChannel(socket, socket.channelName);
        }

        socket.channelName = channelName;

        if (!channels[channelName]) {
            const client = new tmi.Client({
                channels: [channelName],
                connection: { reconnect: false }
            });
            channels[channelName] = { client, sockets: new Set() };

            client.on('message', (channel, tags, message, self) => {
                const mensaje = {
                    nombre: tags,
                    mensaje: message
                };
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
    });

    socket.on('disconnect', () => {
        console.log('Desconectado');
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
    }
}

http.listen(port, () => {
    console.log('Servidor encendido en el puerto', `${port}`);
});
