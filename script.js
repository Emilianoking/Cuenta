let trabajos = JSON.parse(localStorage.getItem('trabajos')) || [];
let registros = JSON.parse(localStorage.getItem('registros')) || [];
const hoy = new Date().toISOString().split('T')[0];
document.getElementById('fecha').value = hoy;

function actualizarSelectorTrabajos() {
  const select = document.getElementById('seleccionarTrabajo');
  select.innerHTML = '<option value="">Seleccione un trabajo</option>';
  trabajos.forEach(trabajo => {
    const option = document.createElement('option');
    option.value = trabajo.nombre;
    option.textContent = trabajo.nombre;
    select.appendChild(option);
  });
}

function agregarTrabajo() {
  const nombre = document.getElementById('nombreTrabajo').value.trim();
  const precio = parseFloat(document.getElementById('precioTrabajo').value);

  if (!nombre || isNaN(precio) || precio <= 0) {
    alert('Por favor, ingrese un nombre y un precio por hora válidos.');
    return;
  }

  if (trabajos.some(t => t.nombre === nombre)) {
    alert('Ya existe un trabajo con ese nombre.');
    return;
  }

  trabajos.push({ nombre, precio });
  localStorage.setItem('trabajos', JSON.stringify(trabajos));
  document.getElementById('nombreTrabajo').value = '';
  document.getElementById('precioTrabajo').value = '';
  actualizarTablaTrabajos();
  actualizarSelectorTrabajos();
}

function eliminarTrabajo(nombre) {
  if (registros.some(r => r.trabajo === nombre)) {
    alert('No se puede eliminar este trabajo porque tiene horas registradas.');
    return;
  }
  trabajos = trabajos.filter(t => t.nombre !== nombre);
  localStorage.setItem('trabajos', JSON.stringify(trabajos));
  actualizarTablaTrabajos();
  actualizarSelectorTrabajos();
}

function actualizarTablaTrabajos() {
  const listaTrabajos = document.getElementById('listaTrabajos');
  listaTrabajos.innerHTML = '';
  trabajos.forEach(trabajo => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${trabajo.nombre}</td>
      <td>${trabajo.precio.toFixed(2)}</td>
      <td><button class="delete-btn" onclick="eliminarTrabajo('${trabajo.nombre}')">Eliminar</button></td>
    `;
    listaTrabajos.appendChild(row);
  });
}

function agregarHoras() {
  const trabajo = document.getElementById('seleccionarTrabajo').value;
  const fecha = document.getElementById('fecha').value;
  const horas = parseFloat(document.getElementById('horas').value);

  if (!trabajo || !fecha || isNaN(horas) || horas < 0) {
    alert('Por favor, seleccione un trabajo, ingrese una fecha y horas válidas.');
    return;
  }

  registros.push({ trabajo, fecha, horas });
  localStorage.setItem('registros', JSON.stringify(registros));
  document.getElementById('horas').value = '';
  actualizarTablaHoras();
  actualizarResumen();
}

function eliminarRegistro(index) {
  registros.splice(index, 1);
  localStorage.setItem('registros', JSON.stringify(registros));
  actualizarTablaHoras();
  actualizarResumen();
}

function actualizarTablaHoras() {
  const listaHoras = document.getElementById('listaHoras');
  listaHoras.innerHTML = '';
  registros.forEach((registro, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${registro.fecha}</td>
      <td>${registro.trabajo}</td>
      <td>${registro.horas}</td>
      <td><button class="delete-btn" onclick="eliminarRegistro(${index})">Eliminar</button></td>
    `;
    listaHoras.appendChild(row);
  });
}

function actualizarResumen() {
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth();
  const anioActual = fechaActual.getFullYear();

  const resumenTrabajos = document.getElementById('resumenTrabajos');
  resumenTrabajos.innerHTML = '<h4>Por Trabajo:</h4>';
  let totalHoras = 0;
  let totalGanado = 0;

  trabajos.forEach(trabajo => {
    const horasMes = registros
      .filter(r => {
        const fechaReg = new Date(r.fecha);
        return r.trabajo === trabajo.nombre &&
               fechaReg.getMonth() === mesActual &&
               fechaReg.getFullYear() === anioActual;
      })
      .reduce((total, r) => total + r.horas, 0);

    const ganadoMes = horasMes * trabajo.precio;
    totalHoras += horasMes;
    totalGanado += ganadoMes;

    if (horasMes > 0) {
      const p = document.createElement('p');
      p.textContent = `${trabajo.nombre}: ${horasMes} horas, ${ganadoMes.toFixed(2)} €`;
      resumenTrabajos.appendChild(p);
    }
  });

  document.getElementById('totalHoras').textContent = `Total horas: ${totalHoras}`;
  document.getElementById('totalGanado').textContent = `Total ganado: ${totalGanado.toFixed(2)} €`;
}

// Inicializar al cargar la página
actualizarTablaTrabajos();
actualizarSelectorTrabajos();
actualizarTablaHoras();
actualizarResumen();