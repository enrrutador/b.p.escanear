let isInitialized = false;
let isScanning = false;
let detectionCount = 0; // Contador de detecciones
let lastDetectedCode = ''; // Último código detectado

// Base de datos simulada de productos
const productDatabase = {
  '7501055309474': { name: 'Coca-Cola 600ml', price: '$15.00' },
  '7501000911288': { name: 'Sabritas Original 45g', price: '$12.50' },
  '7501030440818': { name: 'Bimbo Pan Blanco', price: '$35.00' },
  '7501052435626': { name: 'Leche Alpura 1L', price: '$23.50' },
  '7501008042090': { name: 'Galletas Marías Gamesa', price: '$18.00' },
};

function showError(message) {
  const errorElement = document.getElementById('error-message');
  errorElement.textContent = message;
  console.error(message);
}

function updateDebugInfo(message) {
  const debugElement = document.getElementById('debug-info');
  debugElement.textContent += new Date().toLocaleTimeString() + ': ' + message + '\n';
  console.log(message);
}

function initializeScanner() {
  updateDebugInfo('Inicializando escáner...');
  if (typeof Quagga === 'undefined') {
    showError('Error: La biblioteca Quagga no se ha cargado correctamente.');
    return;
  }

  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.querySelector("#scanner-container"),
      constraints: {
        width: 640,
        height: 480,
        facingMode: "environment"
      },
    },
    locator: {
      patchSize: "medium",
      halfSample: true
    },
    numOfWorkers: 2,
    decoder: {
      readers: [
        "ean_reader",
        "ean_8_reader",
        "upc_reader",
        "code_39_reader",
        "code_128_reader"
      ]
    },
    locate: true
  }, function(err) {
    if (err) {
      console.error("Error al iniciar Quagga:", err);
      showError("Error al inicializar el escáner: " + err);
      return;
    }
    updateDebugInfo("Quagga inicializado correctamente");
    isInitialized = true;
  });

  Quagga.onProcessed(function(result) {
    updateDebugInfo('Imagen procesada');
  });

  Quagga.onDetected(function(result) {
    let code = result.codeResult.code;
    let type = result.codeResult.format;

    // Verificar si es el mismo código que el último detectado
    if (code === lastDetectedCode) {
      detectionCount++; // Aumentar el contador si es el mismo código
    } else {
      detectionCount = 1; // Reiniciar el contador si es un nuevo código
      lastDetectedCode = code; // Actualizar el último código detectado
    }

    document.getElementById("code").textContent = code;
    document.getElementById("type").textContent = type;
    updateDebugInfo("Código detectado: " + code + " (Tipo: " + type + "), Detecciones consecutivas: " + detectionCount);
    displayProductInfo(code);

    // Detener el escaneo si el mismo código se detecta 4 veces
    if (detectionCount >= 4) {
      stopScanner();
      updateDebugInfo("El escaneo se detuvo automáticamente después de 4 detecciones consecutivas del mismo código.");
    }
  });
}

function startScanner() {
  if (!isInitialized) {
    showError("Por favor, inicializa el escáner primero.");
    return;
  }
  if (isScanning) {
    updateDebugInfo('El escáner ya está en funcionamiento.');
    return;
  }
  updateDebugInfo('Iniciando escaneo...');
  Quagga.start();
  isScanning = true;
  detectionCount = 0; // Reiniciar el contador al iniciar el escaneo
  lastDetectedCode = ''; // Limpiar el último código detectado
}

function stopScanner() {
  if (!isScanning) {
    updateDebugInfo("El escáner no está en funcionamiento.");
    return;
  }
  Quagga.stop();
  isScanning = false;
  updateDebugInfo("Escáner detenido");
}

function displayProductInfo(code) {
  const productInfoElement = document.getElementById('product-info');
  if (productDatabase[code]) {
    const product = productDatabase[code];
    productInfoElement.innerHTML = `
      <h3>Información del Producto</h3>
      <p><strong>Nombre:</strong> ${product.name}</p>
      <p><strong>Precio:</strong> ${product.price}</p>
    `;
  } else {
    productInfoElement.innerHTML = `
      <h3>Información del Producto</h3>
      <p>No se encontró información para el código ${code}</p>
    `;
  }
}

window.addEventListener('load', function() {
  if (typeof Quagga === 'undefined') {
    showError('La biblioteca Quagga no se ha cargado correctamente. Por favor, verifica tu conexión a internet y recarga la página.');
  } else {
    updateDebugInfo('Página cargada correctamente, Quagga disponible');
  }
});
