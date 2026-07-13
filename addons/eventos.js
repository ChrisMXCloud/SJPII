// ============================================
// SISTEMA DE EVENTOS - PARROQUIA SAN JUAN PABLO II
// ============================================


const DURACION_MISA = 60;
const DURACION_HORA_SANTA = 60;


let eventosEspeciales = [];


// Horarios ordinarios

const eventos = [

    // DOMINGO

    {
        nombre:"Santa Misa de 7:00 AM",
        dia:0,
        hora:"07:00",
        duracion:DURACION_MISA
    },

    {
        nombre:"Santa Misa de 8:30 AM",
        dia:0,
        hora:"08:30",
        duracion:DURACION_MISA
    },

    {
        nombre:"Santa Misa de 10:00 AM",
        dia:0,
        hora:"10:00",
        duracion:DURACION_MISA
    },

    {
        nombre:"Santa Misa de 12:00 PM",
        dia:0,
        hora:"12:00",
        duracion:DURACION_MISA
    },

    {
        nombre:"Santa Misa de 1:15 PM",
        dia:0,
        hora:"13:15",
        duracion:DURACION_MISA
    },

    {
        nombre:"Santa Misa de 7:00 PM",
        dia:0,
        hora:"19:00",
        duracion:DURACION_MISA
    },

    {
        nombre:"Santa Misa de 8:10 PM",
        dia:0,
        hora:"20:10",
        duracion:DURACION_MISA
    },


    // MARTES

    {
        nombre:"Santa Misa",
        dia:2,
        hora:"08:00",
        duracion:DURACION_MISA
    },

    {
        nombre:"Santa Misa",
        dia:2,
        hora:"19:00",
        duracion:DURACION_MISA
    },


    // MIÉRCOLES

    {
        nombre:"Santa Misa",
        dia:3,
        hora:"08:00",
        duracion:DURACION_MISA
    },

    {
        nombre:"Santa Misa",
        dia:3,
        hora:"19:00",
        duracion:DURACION_MISA
    },


    // JUEVES

    {
        nombre:"Santa Misa",
        dia:4,
        hora:"08:00",
        duracion:DURACION_MISA
    },

    {
        nombre:"Santa Misa",
        dia:4,
        hora:"19:00",
        duracion:DURACION_MISA
    },

    {
        nombre:"Hora Santa",
        dia:4,
        hora:"19:45",
        duracion:DURACION_HORA_SANTA
    },


    // VIERNES

    {
        nombre:"Santa Misa",
        dia:5,
        hora:"08:00",
        duracion:DURACION_MISA
    },

    {
        nombre:"Santa Misa",
        dia:5,
        hora:"19:00",
        duracion:DURACION_MISA
    },


    // SÁBADO

    {
        nombre:"Santa Misa",
        dia:6,
        hora:"19:00",
        duracion:DURACION_MISA
    }

];

// ============================================
// CARGAR EVENTOS ESPECIALES DESDE JSON
// ============================================

fetch("eventos-especiales.json")
.then(respuesta => respuesta.json())
.then(datos => {

    if(datos.estado === "OK") {

        eventosEspeciales = datos.eventos;

    } else {

        eventosEspeciales = [];

    }

    iniciarSistema();

})
.catch(error => {

    console.error("Error cargando eventos especiales:", error);

    iniciarSistema();

});


// ============================================
// CONVERTIR HORA A FECHA
// ============================================

function crearFecha(dia, hora) {

    let fecha = new Date();

    fecha.setDate(
        fecha.getDate() + ((dia - fecha.getDay() + 7) % 7)
    );


    let partes = hora.split(":");

    fecha.setHours(
        parseInt(partes[0]),
        parseInt(partes[1]),
        0,
        0
    );


    return fecha;

}


// ============================================
// EVENTOS ESPECIALES A FECHA REAL
// ============================================

function convertirEspeciales() {

    return eventosEspeciales.map(evento => {


        let fecha = new Date(
            evento.fecha + "T" + evento.hora
        );


        return {

            nombre:evento.nombre,

            fecha:fecha,

            duracion: DURACION_MISA

        };


    });

}


// ============================================
// OBTENER TODOS LOS EVENTOS
// ============================================

function obtenerTodosLosEventos() {


    let lista = [];


    // Eventos ordinarios

    eventos.forEach(evento => {


        lista.push({

            nombre:evento.nombre,

            fecha:
            crearFecha(
                evento.dia,
                evento.hora
            ),

            duracion:evento.duracion

        });


    });



    // Eventos especiales

    lista = lista.concat(
        convertirEspeciales()
    );


    return lista;

}

// ============================================
// BUSCAR EVENTO ACTUAL
// ============================================

function obtenerEventoActual() {


    let ahora = new Date();

    let lista = obtenerTodosLosEventos();



    for(let evento of lista) {


        let inicio = evento.fecha;


        let fin = new Date(
            inicio.getTime() +
            evento.duracion * 60000
        );



        if(
            ahora >= inicio &&
            ahora <= fin
        ){

            return evento;

        }

    }


    return null;

}



// ============================================
// BUSCAR PRÓXIMO EVENTO
// ============================================

function obtenerProximoEvento() {


    let ahora = new Date();


    let lista = obtenerTodosLosEventos()
    .filter(evento => evento.fecha > ahora);



    lista.sort(
        (a,b)=>a.fecha-b.fecha
    );


    return lista[0] || null;

}



// ============================================
// FORMATO DE FECHA
// ============================================

function formatoFecha(fecha){


    return fecha.toLocaleDateString(
        "es-MX",
        {
            weekday:"long",
            day:"numeric",
            month:"long"
        }
    );


}



// ============================================
// FORMATO DE HORA
// ============================================

function formatoHora(fecha){


    return fecha.toLocaleTimeString(
        "es-MX",
        {
            hour:"numeric",
            minute:"2-digit"
        }
    );


}

// ============================================
// ACTUALIZAR PANTALLA
// ============================================

function actualizarEvento(){


    const estado = document.getElementById("estadoEvento");
    const nombre = document.getElementById("nombreEvento");
    const fecha = document.getElementById("fechaEvento");
    const contadorBox = document.getElementById("contadorContainer");
    const contador = document.getElementById("contador");



    if(!estado || !nombre) return;



    // Revisar si hay evento actual

    let actual = obtenerEventoActual();



    if(actual){


        estado.innerHTML =
        "🔴 En este momento";


        estado.style.color =
        "#C62828";



        nombre.innerHTML =
        actual.nombre;



        fecha.innerHTML =
        "Actividad en curso";



        contadorBox.style.display =
        "none";



        return;


    }



    // Si no hay evento, buscar próximo


    let proximo = obtenerProximoEvento();



    if(proximo){


        estado.innerHTML =
        "🟢 Próximo evento";


        estado.style.color =
        "#2E7D32";



        nombre.innerHTML =
        proximo.nombre;



        fecha.innerHTML =
        formatoFecha(proximo.fecha)
        +
        "<br>"
        +
        formatoHora(proximo.fecha);



        contadorBox.style.display =
        "block";



        actualizarContador(
            proximo.fecha
        );


    }

    else{


        estado.innerHTML =
        "🟢 No hay actividades";


        nombre.innerHTML =
        "No hay eventos programados";


        fecha.innerHTML =
        "";


        contadorBox.style.display =
        "none";


    }


}



// ============================================
// CONTADOR REGRESIVO
// ============================================

function actualizarContador(fechaEvento){


    const contador =
    document.getElementById("contador");


    if(!contador) return;



    let ahora = new Date();


    let diferencia =
    fechaEvento - ahora;



    if(diferencia <= 0){

        actualizarEvento();

        return;

    }



    let dias =
    Math.floor(
        diferencia /
        (1000*60*60*24)
    );



    let horas =
    Math.floor(
        (diferencia %
        (1000*60*60*24))
        /
        (1000*60*60)
    );



    let minutos =
    Math.floor(
        (diferencia %
        (1000*60*60))
        /
        (1000*60)
    );



    let segundos =
    Math.floor(
        (diferencia %
        (1000*60))
        /
        1000
    );



    contador.innerHTML =

    dias + " días " +
    horas.toString().padStart(2,"0")
    + " h " +

    minutos.toString().padStart(2,"0")
    + " min " +

    segundos.toString().padStart(2,"0")
    + " s";


}



// ============================================
// INICIAR SISTEMA
// ============================================

function iniciarSistema(){


    actualizarEvento();


    setInterval(()=>{


        actualizarEvento();


    },1);


}