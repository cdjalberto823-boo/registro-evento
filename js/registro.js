const mesasData = {
    "Mesa 1": { capacidadTotal: 15, ocupados: 0 },
    "Mesa 2": { capacidadTotal: 15, ocupados: 0 },
    "Mesa 3": { capacidadTotal: 15, ocupados: 0 },
    "Mesa 4": { capacidadTotal: 15, ocupados: 0 }
};

document.addEventListener("DOMContentLoaded", () => {
    // Cargar registros previos de localStorage para sincronizar cupos
    const registrosPrevios = JSON.parse(localStorage.getItem("asistentes_czm")) || [];
    
    // Resetear contador de ocupados antes de recalcular
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

// Renderiza el plano SVG con la mesa central, el ícono temático exacto y sus 15 sillas
function renderizarMesaSVG(idContenedor, ocupados, limite = 15, numeroMesa = 1) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;

    // Íconos exactos de Bootstrap Icons (Gobernanza, Financiamiento, Mapa y Gráfica)
    const simbolosMesa = {
        // Mesa 1: Gobernanza (Personas - bi-people-fill)
        1: '<path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>',
        
        // Mesa 2: Financiamiento (Moneda/Efectivo - bi-cash-coin)
        2: '<path d="M8 3c-1.552 0-2.84.07-3.68.136-.51.04-.82.115-.82.115l-.01.002h-.002L3.48 3.26a1.5 1.5 0 0 0-1.22 1.22l-.009.008C2.25 4.5 2.175 4.81 2.135 5.32 2.07 6.16 2 7.448 2 9c0 1.552.07 2.84.136 3.68.04.51.115.82.115.82l.002.01h.002l.008.008a1.5 1.5 0 0 0 1.22 1.22l.008.009c.012.001.322.076.832.116C5.16 14.93 6.448 15 8 15c1.552 0 2.84-.07 3.68-.136.51-.04.82-.115.82-.115l.01-.002h.002l.008-.008a1.5 1.5 0 0 0 1.22-1.22l.009-.008c.001-.012.076-.322.116-.832C13.93 11.84 14 10.552 14 9c0-1.552-.07-2.84-.136-3.68-.04-.51-.115-.82-.115-.82l-.002-.01h-.002l-.008-.008a1.5 1.5 0 0 0-1.22-1.22l-.008-.009c-.012-.001-.322-.076-.832-.116C10.84 3.07 9.552 3 8 3m-2.5 6a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0"/>',
        
        // Mesa 3: Planeación Territorial (Mapa - bi-map-fill)
        3: '<path fill-rule="evenodd" d="M16 5.35s-1.555-.597-3.73-.238c-2.029.336-3.882 1.547-5.918 1.547-2.035 0-3.888-1.21-5.918-1.547C-.14 5.053-1 .253-1 .253V10.8a1 1 0 0 0 .524.872c1.787.973 3.682.748 5.706.748 2.036 0 3.888 1.21 5.918 1.547 2.175.36 3.73-.238 3.73-.238V5.35zM6 3.61c1.867 0 3.593 1.11 5.5 1.425v7.2c-1.907-.315-3.633-1.425-5.5-1.425s-3.633 1.11-5.5 1.425V5.035C2.367 4.72 4.093 3.61 6 3.61z"/>',
        
        // Mesa 4: Información y Evaluación (Gráfica de barras - bi-bar-chart-fill)
        4: '<path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"/>'
    };

    let svgHtml = `
    <svg viewBox="0 0 220 160" width="100%" height="130" class="mesa-svg-plano">
        <!-- Mesa central -->
        <rect x="50" y="40" width="120" height="80" rx="12" ry="12" fill="#eef2f6" stroke="#cbd5e1" stroke-width="2.5" />
        
        <!-- Ícono temático exacto al centro de la mesa -->
        <g transform="translate(101, 69) scale(1.3)" fill="#004d43">
            ${simbolosMesa[numeroMesa] || simbolosMesa[1]}
        </g>
    `;

    // Posiciones exactas (x, y) de las 15 sillas alrededor
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
        const colorSilla = estaOcupada ? "#cbd5e1" : "#10b981";
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

// Actualizar barras de progreso, plano SVG y contadores en tiempo real
function actualizarInterfazLugares() {
    const mapaIds = {
        "Mesa 1": { id: "mesa1", num: 1 },
        "Mesa 2": { id: "mesa2", num: 2 },
        "Mesa 3": { id: "mesa3", num: 3 },
        "Mesa 4": { id: "mesa4", num: 4 }
    };

    for (const [nombreMesa, info] of Object.entries(mesasData)) {
        const datosMesa = mapaIds[nombreMesa];
        const disponibles = info.capacidadTotal - info.ocupados;
        const porcentaje = (disponibles / info.capacidadTotal) * 100;

        // Renderizar el plano SVG con su ícono temático correspondiente
        renderizarMesaSVG(`plano-${datosMesa.id}`, info.ocupados, info.capacidadTotal, datosMesa.num);

        const txtElemento = document.getElementById(`txt-${datosMesa.id}`);
        const barElemento = document.getElementById(`bar-${datosMesa.id}`);

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

// Registro del formulario y modal de confirmación
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
