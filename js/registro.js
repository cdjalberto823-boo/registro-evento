const mesasData = {
    "Mesa 1": { capacidadTotal: 15, ocupados: 0 },
    "Mesa 2": { capacidadTotal: 15, ocupados: 0 },
    "Mesa 3": { capacidadTotal: 15, ocupados: 0 },
    "Mesa 4": { capacidadTotal: 15, ocupados: 0 }
};

document.addEventListener("DOMContentLoaded", () => {
    // Cargar registros previos de localStorage
    const registrosPrevios = JSON.parse(localStorage.getItem("asistentes_czm")) || [];
    
    // Resetear contador de ocupados
    for (const key in mesasData) {
        mesasData[key].ocupados = 0;
    }

    registrosPrevios.forEach(reg => {
        if (mesasData[reg.mesa]) {
            mesasData[reg.mesa].ocupados++;
        }
    });

    actualizarInterfazLugares();
    inicializarSeleccionMesas();
    inicializarFormulario();
});

// Renderiza el plano SVG con la mesa central y 15 sillas dispuestas alrededor
function renderizarMesaSVG(idContenedor, ocupados, limite = 15) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;

    let svgHtml = `
    <svg viewBox="0 0 220 160" width="100%" height="130" class="mesa-svg-plano">
        <!-- Mesa central -->
        <rect x="50" y="40" width="120" height="80" rx="12" ry="12" fill="#eef2f6" stroke="#cbd5e1" stroke-width="2.5" />
        <text x="110" y="84" font-size="12" font-weight="700" fill="#475569" text-anchor="middle">MESA</text>
    `;

    // Posiciones exactas (x, y) de las 15 sillas alrededor de la mesa
    const posiciones = [
        // Arriba (5 sillas)
        {x: 62, y: 22}, {x: 86, y: 22}, {x: 110, y: 22}, {x: 134, y: 22}, {x: 158, y: 22},
        // Derecha (3 sillas)
        {x: 184, y: 54}, {x: 184, y: 80}, {x: 184, y: 106},
        // Abajo (5 sillas)
        {x: 158, y: 138}, {x: 134, y: 138}, {x: 110, y: 138}, {x: 86, y: 138}, {x: 62, y: 138},
        // Izquierda (2 sillas)
        {x: 36, y: 93}, {x: 36, y: 67}
    ];

    for (let i = 0; i < limite; i++) {
        const estaOcupada = i < ocupados;
        const colorSilla = estaOcupada ? "#cbd5e1" : "#10b981"; // Gris = Ocupado | Verde = Disponible
        const pos = posiciones[i];

        svgHtml += `
            <circle cx="${pos.x}" cy="${pos.y}" r="7.5" fill="${colorSilla}" class="silla-node ${estaOcupada ? 'ocupada' : 'disponible'}">
                <title>Asiento ${i + 1}: ${estaOcupada ? 'Ocupado' : 'Disponible'}</title>
            </circle>
        `;
    }

    svgHtml += `</svg>`;
    contenedor.innerHTML = svgHtml;
}

// Actualizar barras de progreso, plano SVG y contadores
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

        // Renderizar el plano SVG
        renderizarMesaSVG(`plano-${idSuffix}`, info.ocupados, info.capacidadTotal);

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
                barElemento.style.backgroundColor = "#10b981";
            }
        }
    }
}

// Selección interactiva de tarjetas
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

// Registro del formulario y modal
function inicializarFormulario() {
    const btnRegistrar = document.getElementById("btnRegistrar");

    if (btnRegistrar) {
        btnRegistrar.addEventListener("click", (e) => {
            e.preventDefault();

            const nombre = document.getElementById("nombre").value.trim();
            const cargo = document.getElementById("cargo").value.trim();
            const telefono = document.getElementById("telefono").value.trim();
            const correo = document.getElementById("correo").value.trim();
            const mesaSeleccionada = document.getElementById("mesaSeleccionada").value;

            if (!nombre || !cargo || !telefono || !correo) {
                alert("⚠️ Por favor completa todos los campos del formulario (Nombre, Cargo, Teléfono y Correo).");
                return;
            }

            if (!mesaSeleccionada) {
                alert("⚠️ Debes hacer clic sobre una de las 4 Mesas de Trabajo para seleccionarla.");
                return;
            }

            if (mesasData[mesaSeleccionada]) {
                mesasData[mesaSeleccionada].ocupados++;
                actualizarInterfazLugares();
            }

            const folioFormateado = `CZM-${String(Date.now()).slice(-5)}`;

            const nuevoRegistro = {
                folio: folioFormateado,
                nombre: nombre,
                cargo: cargo,
                telefono: telefono,
                correo: correo,
                mesa: mesaSeleccionada,
                fecha: new Date().toLocaleString('es-MX')
            };

            let registrosGuardados = JSON.parse(localStorage.getItem("asistentes_czm")) || [];
            registrosGuardados.push(nuevoRegistro);
            localStorage.setItem("asistentes_czm", JSON.stringify(registrosGuardados));

            document.getElementById("modalFolio").textContent = folioFormateado;
            document.getElementById("modalNombre").textContent = nombre;
            document.getElementById("modalCargo").textContent = cargo;
            document.getElementById("modalMesa").textContent = mesaSeleccionada;

            const modalConfirmacion = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
            modalConfirmacion.show();

            document.getElementById('modalConfirmacion').addEventListener('hidden.bs.modal', function () {
                document.getElementById("registroForm").reset();
                document.querySelectorAll(".mesa-card").forEach(m => m.classList.remove("seleccionada"));
                document.getElementById("mesaSeleccionada").value = "";
            }, { once: true });
        });
    }
}
