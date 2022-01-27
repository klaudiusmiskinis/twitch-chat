const socket = io()
let cont = 0;
let parar = false;

socket.on('mensaje', (mensaje) => {
    let eleMensaje = '<div class="d-row mb-2" id="mensaje">' +
                        '<div><b>' + mensaje.nombre.username + '</b></div>' +
                        '<div>' + mensaje.mensaje + '</div>' + 
                    '</div>';
    if (mensaje.nombre.subscriber) {
        eleMensaje = '<div class="d-row mb-2" id="mensaje">' +
                            '<div><b><i class="bi bi-star-fill me-2 text-danger"></i>' + mensaje.nombre.username + '</b></div>' +
                            '<div>' + mensaje.mensaje + '</div>' + 
                        '</div>';
    }
    if (mensaje.nombre.mod) {
        eleMensaje = '<div class="d-row mb-2" id="mensaje">' +
                            '<div><b><i class="bi bi-wrench me-2 text-danger"></i>' + mensaje.nombre.username + '</b></div>' +
                            '<div>' + mensaje.mensaje + '</div>' + 
                        '</div>';
    }
    let chat = document.getElementById('chat');
    chat.style.transition = 'all 1s cubic-bezier(0.1, 0.79, 0.49, 0.96) 0s'
    chat.insertAdjacentHTML('beforeend', eleMensaje);
    if (parar == false) {
        chat.scrollBy({top: 200})
    }
    cont++;
    document.getElementById('contador').innerHTML = " " + cont;
})

document.getElementById('cambiar').onclick = function() {
    let nombre = document.getElementById('nombre').value;
    if(nombre.length > 0) {
        socket.emit('nombre', nombre);
        let eleMensaje = '<div class="d-row mb-2 aviso bg-color rounded p-1 px-2">' +
                        '<div><b class="text-dark"> Se ha cambiado el canal a ' + nombre + '</b></div>' +
                       ' </div>';
        let chat = document.getElementById('chat');
        chat.insertAdjacentHTML('beforeend', eleMensaje);
    }
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
