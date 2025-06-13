const socket = io();
const defaultChannel = 'illojuan';
let cont = 0;
let parar = false;
let currentChannel = defaultChannel;
const watchersEl = document.getElementById('watchers');
const cambiarBtn = document.getElementById('cambiar');

// Join default channel once connected
socket.emit('join', defaultChannel);
document.getElementById('nombre').value = defaultChannel;

socket.on('mensaje', (mensaje) => {
    const chat = document.getElementById('chat');
    const wrapper = document.createElement('div');
    wrapper.classList.add('d-row', 'mb-2');
    wrapper.id = 'mensaje';

    const userDiv = document.createElement('div');
    const nameBold = document.createElement('b');

    const iconClass = mensaje.nombre.mod
        ? 'bi bi-wrench me-2 text-danger'
        : mensaje.nombre.subscriber
            ? 'bi bi-star-fill me-2 text-danger'
            : null;
    if (iconClass) {
        const icon = document.createElement('i');
        icon.className = iconClass;
        nameBold.appendChild(icon);
    }

    nameBold.appendChild(document.createTextNode(mensaje.nombre.username));
    userDiv.appendChild(nameBold);

    const msgDiv = document.createElement('div');
    msgDiv.textContent = mensaje.mensaje;

    wrapper.appendChild(userDiv);
    wrapper.appendChild(msgDiv);

    chat.style.transition = 'all 1s cubic-bezier(0.1, 0.79, 0.49, 0.96) 0s'
    chat.appendChild(wrapper);
    if (parar == false) {
        chat.scrollBy({top: 200})
    }
    cont++;
    document.getElementById('contador').innerHTML = " " + cont;
})

socket.on('watchers', (count) => {
    if (count > 1) {
        watchersEl.textContent = `Somos ${count} viendo este chat`;
    } else {
        watchersEl.textContent = '';
    }
});

cambiarBtn.addEventListener('click', () => {
    if (cambiarBtn.disabled) return;
    cambiarBtn.disabled = true;

    let nombre = document.getElementById('nombre').value;
    if (nombre.length > 0) {
        socket.emit('join', nombre);
        currentChannel = nombre;
        const chat = document.getElementById('chat');
        const wrapper = document.createElement('div');
        wrapper.classList.add('d-row', 'mb-2', 'aviso', 'bg-color', 'rounded', 'p-1', 'px-2');
        const innerDiv = document.createElement('div');
        const b = document.createElement('b');
        b.classList.add('text-dark');
        b.textContent = ' Se ha cambiado el canal a ' + nombre;
        innerDiv.appendChild(b);
        wrapper.appendChild(innerDiv);
        chat.appendChild(wrapper);
    }

    setTimeout(() => {
        cambiarBtn.disabled = false;
    }, 2000);
});

document.getElementById('bug').onclick = function() {
    socket.emit('bug');
}

document.getElementById('descargar').onclick = async function() {
    const res = await fetch(`/messages/${currentChannel}`);
    if (!res.ok) return;
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentChannel}-chat.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

var lastScrollTop = 0;

document.getElementById('chat').addEventListener("scroll", function(){
   var st = window.pageYOffset || document.getElementById('chat').scrollTop;
   if (st < lastScrollTop){
        parar = true;
   } else {
       parar = false;
   }
   lastScrollTop = st <= 0 ? 0 : st;
}, false);
