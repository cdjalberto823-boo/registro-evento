const mesasData = {
    "Mesa 1": { capacidadTotal: 15, ocupados: 0, moderador: "Modera Mesa 1" },
    "Mesa 2": { capacidadTotal: 15, ocupados: 0, moderador: "Modera Mesa 2" },
    "Mesa 3": { capacidadTotal: 15, ocupados: 0, moderador: "Modera Mesa 3" },
    "Mesa 4": { capacidadTotal: 15, ocupados: 0, moderador: "Modera Mesa 4" }
};

let contadorFolio = 0;

document.addEventListener("DOMContentLoaded", () => {
    // Cargar cupos existentes si los hay en el navegador
    const registrosPrevios = JSON.parse(localStorage.getItem("asistentes_czm")) || [];
    registrosPrevios.forEach(reg => {
        if (mesasData[reg.mesa]) {
            mesasData[reg.mesa].ocupados++;
        }
    });

    renderizarAsientos();
    actualizarInterfazLugares();
    inicializarSeleccionMesas();
    inicializarFormulario();
});

// Renderizar puntos/asientos en las tarjetas
function renderizarAsientos() {
    const mapaIds = {
        "Mesa 1": "mesa1",
        "Mesa 2": "mesa2",
        "Mesa 3": "mesa3",
        "Mesa 4": "mesa4"
    };

    for (const [nombreMesa, info] of Object.entries(mesasData)) {
        const idSuffix = mapaIds[nombreMesa];
        const topContainer = document.getElementById(`sillas-top-${idSuffix}`);
        const bottomContainer = document.getElementById(`sillas-bottom-${idSuffix}`);

        if (topContainer && bottomContainer) {
            topContainer.innerHTML = "";
            bottomContainer.innerHTML = "";

            for (let i = 0; i < info.capacidadTotal; i++) {
                const silla = document.createElement("span");
                silla.classList.add("silla-dot");
                silla.classList.add(i < info.ocupados ? "ocupado" : "disponible");

                if (i < 8) {
                    topContainer.appendChild(silla);
                } else {
                    bottomContainer.appendChild(silla);
                }
            }
        }
    }
}

// Actualizar barras de progreso y textos de disponibilidad
function actualizarInterfazLugares() {
    const mapaIds = {
        "Mesa 1": "mesa1",
        "Mesa 2": "mesa2",
        "Mesa 3": "mesa3",
        "Mesa 4": "mesa4"
    };

    for (const [nombreMesa, info] of Object.entries(mesasData)) {
        const idSuffix = mapaIds[nombreMesa];
        const disponibles = info.capacidadTotal - info.ocupados;
        const porcentaje = (disponibles / info.capacidadTotal) * 100;

        const txtElemento = document.getElementById(`txt-${idSuffix}`);
        const barElemento = document.getElementById(`bar-${idSuffix}`);

        if (txtElemento && barElemento) {
            txtElemento.textContent = `${disponibles} / ${info.capacidadTotal} disponibles`;
            barElemento.style.width = `${porcentaje}%`;

            if (disponibles <= 3) {
                barElemento.style.backgroundColor = "#ef4444";
            } else if (disponibles <= 7) {
                barElemento.style.backgroundColor = "#f59e0b";
            } else {
                barElemento.style.backgroundColor = "#22c55e";
            }
        }
    }

    renderizarAsientos();
}

// Selección visual de tarjetas
function inicializarSeleccionMesas() {
    const tarjetasMesa = document.querySelectorAll(".mesa-card");
    const campoMesaOculto = document.getElementById("mesaSeleccionada");

    tarjetasMesa.forEach(card => {
        card.addEventListener("click", () => {
            const nombreMesa = card.dataset.mesa;
            const info = mesasData[nombreMesa];

            if (info.capacidadTotal - info.ocupados <= 0) {
                alert("Esta mesa ya no cuenta con lugares disponibles.");
                return;
            }

            tarjetasMesa.forEach(m => m.classList.remove("seleccionada"));
            card.classList.add("seleccionada");
            campoMesaOculto.value = nombreMesa;
        });
    });
}

// Procesar el registro y desplegar modal con botón Aceptar
function inicializarFormulario() {
    const btnRegistrar = document.getElementById("btnRegistrar");

    if (btnRegistrar) {
        btnRegistrar.addEventListener("click", (e) => {
            e.preventDefault();

            const nombre = document.getElementById("nombre").value.trim();
            const cargo = document.getElementById("cargo").value.trim();
            const telefono = document.getElementById("telefono").value.trim();
            const mesaSeleccionada = document.getElementById("mesaSeleccionada").value;

            if (!nombre || !cargo || !telefono) {
                alert("⚠️ Por favor completa tu Nombre, Cargo y Teléfono.");
                return;
            }

            if (!mesaSeleccionada) {
                alert("⚠️ Debes hacer clic sobre una de las 4 Mesas de Trabajo para seleccionarla.");
                return;
            }

            // Actualizar disponibilidad
            if (mesasData[mesaSeleccionada]) {
                mesasData[mesaSeleccionada].ocupados++;
                actualizarInterfazLugares();
            }

            // Generar folio único
            contadorFolio++;
            const folioFormateado = `CZM-${String(Date.now()).slice(-5)}`;

            // Guardar registro en localStorage
            const nuevoRegistro = {
                folio: folioFormateado,
                nombre: nombre,
                cargo: cargo,
                telefono: telefono,
                mesa: mesaSeleccionada,
                fecha: new Date().toLocaleString('es-MX')
            };

            let registrosGuardados = JSON.parse(localStorage.getItem("asistentes_czm")) || [];
            registrosGuardados.push(nuevoRegistro);
            localStorage.setItem("asistentes_czm", JSON.stringify(registrosGuardados));

            // Rellenar datos en el Modal
            document.getElementById("modalFolio").textContent = folioFormateado;
            document.getElementById("modalNombre").textContent = nombre;
            document.getElementById("modalCargo").textContent = cargo;
            document.getElementById("modalMesa").textContent = mesaSeleccionada;

            // Desplegar el modal Bootstrap
            const modalConfirmacion = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
            modalConfirmacion.show();

            // Limpiar formulario al cerrar el modal o dar clic en Aceptar
            document.getElementById('modalConfirmacion').addEventListener('hidden.bs.modal', function () {
                document.getElementById("registroForm").reset();
                document.querySelectorAll(".mesa-card").forEach(m => m.classList.remove("seleccionada"));
                document.getElementById("mesaSeleccionada").value = "";
            });
        });
    }
}