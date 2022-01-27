const express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const tmi = require('tmi.js');
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/app'));

app.get('/socket.io.js', (req, res) => {
    res.sendFile(__dirname + './node_modules/socket.io/socket.io.js')
})

io.on("connection", (socket) => {
    console.log("Conectado")

    socket.on('disconnect', () => {
        console.log('Desconectado')
    })

    socket.on('nombre', (nombre) => {
        cambiarNombre(nombre)
    })
})

http.listen(port, () => {
    console.log('Servidor encendido en el puerto' , `${port}`);
});

let client = new tmi.Client({channels: ['illojuan']});
client.connect();


client.on('message', (channel, tags, message, self) => {
	let mensaje = {
        nombre: tags,
        mensaje: message
    }
    mandarMensaje(mensaje)
});

async function cambiarNombre(nombre) {
	client.opts.channels = [];
        client.part(client.opts.channels[0]);
        client.opts.channels = ['#' + nombre];
        await client.connect();
}

function mandarMensaje(mensaje) {
    io.emit('mensaje', mensaje)
}
