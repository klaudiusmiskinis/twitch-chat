const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const tmi = require('tmi.js');
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/app'));

io.on("connection", (socket) => {
    console.log("Conectado")

    socket.on('disconnect', () => {
        console.log('Desconectado')
    })

    socket.on('nombre', (nombre) => {
        cambiarNombre(nombre)
    })

    socket.on('bug', () => {
        bug();
    })
})

http.listen(port, () => {
    console.log('Servidor encendido en el puerto' , `${port}`);
});

const defaultChannel = process.env.TWITCH_CHANNEL || 'illojuan';
let client = new tmi.Client({
    channels: [defaultChannel],
    connection: { reconnect: false }
});
client.connect().catch(err => {
    console.error('Failed to connect to Twitch:', err.message);
});


client.on('message', (channel, tags, message, self) => {
	let mensaje = {
        nombre: tags,
        mensaje: message
    }
    mandarMensaje(mensaje)
});

async function cambiarNombre(nombre) {
    try {
        client.opts.channels = ['#' + nombre];
        await client.connect();
    } catch (e) {
        console.error('Error cambiando de canal:', e.message);
    }
}

async function bug() {
    try {
        client.opts.channels = [];
        await client.disconnect();
    } catch (e) {
        console.error('Error al reiniciar conexión:', e.message);
    }
}

function mandarMensaje(mensaje) {
    io.emit('mensaje', mensaje)
}
