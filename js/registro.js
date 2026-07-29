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

// Renderiza el plano SVG con la mesa central, el ícono temático y sus 15 sillas
function renderizarMesaSVG(idContenedor, ocupados, limite = 15, numeroMesa = 1) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;

    // Mapa de íconos/simbología según el tema de cada mesa (Bootstrap Icons / SVG Path)
    const simbolosMesa = {
        1: '<path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>', // Gobernanza (Personas)
        2: '<path d="M5.5 9.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0"/><path d="M0 5A1.5 1.5 0 0 1 1.5 3.5h13A1.5 1.5 0 0 1 16 5v6a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 11zm1.5-.5a.5.5 0 0 0-.5.5v1a2.5 2.5 0 0 1 2.5-2.5zm13 0h-1a2.5 2.5 0 0 1 2.5 2.5v-1a.5.5 0 0 0-.5-.5M.5 10v1a.5.5 0 0 0 .5.5h1a2.5 2.5 0 0 1-2.5-2.5m15 1a2.5 2.5 0 0 1-2.5 2.5h1a.5.5 0 0 0 .5-.5z"/>', // Financiamiento (Billetes)
        3: '<path d="M2 1a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm12 1v2.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V2zM2 6h12v7H2z"/>', // Planeación Territorial (Mapa/Plano)
        4: '<path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"/>' // Información y Evaluación (Gráfica)
    };

    let svgHtml = `
    <svg viewBox="0 0 220 160" width="100%" height="130" class="mesa-svg-plano">
        <!-- Mesa central -->
        <rect x="50" y="40" width="120" height="80" rx="12" ry="12" fill="#eef2f6" stroke="#cbd5e1" stroke-width="2.5" />
        
        <!-- Ícono temático al centro de la mesa -->
        <g transform="translate(100, 68) scale(1.2)" fill="#004d43">
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

// Actualizar barras de progreso, plano SVG y contadores
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

        // Renderizar el plano SVG con su ícono temático
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
