// Mostrar nombres de archivos en la interfaz
function actualizarNombreCifrar() {
    const fileInput = document.getElementById('file-to-encrypt');
    const status = document.getElementById('file-name-encrypt');
    if(fileInput.files.length > 0) {
        status.innerText = "📄 Listo para cifrar: " + fileInput.files[0].name;
        status.style.color = "#38bdf8";
    }
}

function actualizarNombreDescifrar() {
    const fileInput = document.getElementById('file-to-decrypt');
    const status = document.getElementById('file-name-decrypt');
    if(fileInput.files.length > 0) {
        status.innerText = "📄 Listo para descifrar: " + fileInput.files[0].name;
        status.style.color = "#a78bfa";
    }
}

// Helper para convertir string a Hash (clave AES)
async function generarClaveAES(password) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: enc.encode("ItsqmetSaltSecura2026"),
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

// ==========================================
// 🔒 1. CIFRAR ARCHIVO (AES-GCM Nativo)
// ==========================================
async function cifrarArchivoAES() {
    const fileInput = document.getElementById('file-to-encrypt');
    const password = document.getElementById('aes-key').value;

    if (fileInput.files.length === 0 || !password) {
        alert("⚠️ Por favor, selecciona un archivo e introduce una clave.");
        return;
    }

    try {
        const file = fileInput.files[0];
        const archivoBuffer = await file.arrayBuffer();
        
        // Generar clave e Vector de Inicialización (IV)
        const claveCrypto = await generarClaveAES(password);
        const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12 bytes para GCM

        // Cifrar datos binarios puros
        const datosCifradosBuffer = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            claveCrypto,
            archivoBuffer
        );

        // Estructurar el archivo de salida: 12 bytes del IV + Datos Cifrados
        const resultadoFinal = new Blob([iv, datosCifradosBuffer], { type: "application/octet-stream" });
        
        // Descarga Forzada Nativa
        const url = URL.createObjectURL(resultadoFinal);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name + ".enc";
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert("🎉 ¡Cifrado exitoso! Archivo descargado.");

    } catch (error) {
        alert("Error en el cifrado: " + error.message);
    }
}

// ==========================================
// 🔓 2. DESCIFRAR ARCHIVO (AES-GCM Nativo)
// ==========================================
async function descifrarArchivoAES() {
    const fileInput = document.getElementById('file-to-decrypt');
    const password = document.getElementById('aes-key-input').value;

    if (fileInput.files.length === 0 || !password) {
        alert("⚠️ Selecciona el archivo .enc e ingresa la contraseña.");
        return;
    }

    try {
        const file = fileInput.files[0];
        const bufferCompleto = await file.arrayBuffer();

        // Extraer los componentes: los primeros 12 bytes son el IV, el resto son los datos cifrados
        const iv = bufferCompleto.slice(0, 12);
        const datosCifrados = bufferCompleto.slice(12);

        const claveCrypto = await generarClaveAES(password);

        // Descifrar de forma nativa
        const datosDescifradosBuffer = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(iv) },
            claveCrypto,
            datosCifrados
        );

        // Descargar el archivo restaurado
        const archivoRestaurado = new Blob([datosDescifradosBuffer], { type: "application/octet-stream" });
        let nombreOriginal = file.name.replace(".enc", "");

        const url = URL.createObjectURL(archivoRestaurado);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreOriginal;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert("🔓 ¡Archivo descifrado correctamente!");

    } catch (error) {
        alert("❌ Error: Contraseña incorrecta o archivo dañado.");
    }
}

// ==========================================
// 🏢 3. GENERAR Y DESCARGAR LLAVES RSA EN FORMATO OPENPGP PERSONALIZADO
// ==========================================
async function generarYDescargarLlavesRSA() {
    // Capturamos los dos valores ingresados por el usuario
    const alias = document.getElementById('rsa-alias').value.trim();
    const email = document.getElementById('rsa-email').value.trim();

    // Validamos que ninguno de los dos campos esté vacío
    if (!alias || !email) {
        alert("⚠️ Por favor, completa tanto el Nombre/Alias como el Correo Electrónico para generar tus llaves.");
        return;
    }

    // Validación básica de formato de correo
    if (!email.includes("@") || !email.includes(".")) {
        alert("⚠️ Por favor, ingresa un formato de correo electrónico válido (ejemplo@dominio.com).");
        return;
    }

    try {
        // Carga dinámica de la librería OpenPGP si no se encuentra en el entorno
        if (typeof openpgp === 'undefined') {
            alert("🔄 Conectando módulos criptográficos PGP... Dale 'Aceptar' para inicializar.");
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = "https://unpkg.com/openpgp@5.11.0/dist/openpgp.min.js";
                script.onload = () => resolve();
                script.onerror = () => reject(new Error("No se pudo cargar el motor OpenPGP de internet."));
                document.head.appendChild(script);
            });
        }

        alert(`⏳ Generando par de llaves OpenPGP para:\n👤 Usuario: ${alias}\n📧 Correo: ${email}\n\nEsto puede tomar entre 3 y 5 segundos. Presiona Aceptar.`);

        // Generar el bloque OpenPGP usando los datos reales ingresados por ti
        const { privateKey, publicKey } = await openpgp.generateKey({
            userIDs: [{ name: alias, email: email }], // Mapeo directo y real de tus inputs
            type: 'rsa',
            rsaBits: 2048,
            format: 'armored'
        });

        // Limpiar el nombre para evitar espacios raros en el nombre del archivo descargado
        const nombreArchivo = alias.replace(/\s+/g, '_');

        // --- DISPARAR DESCARGA CLAVE PÚBLICA (.asc) ---
        const blobPub = new Blob([publicKey], { type: "text/plain;charset=utf-8" });
        const urlPub = URL.createObjectURL(blobPub);
        const linkPub = document.createElement('a');
        linkPub.href = urlPub;
        linkPub.download = `Clave_Publica_${nombreArchivo}.asc`; 
        document.body.appendChild(linkPub);
        linkPub.click();
        document.body.removeChild(linkPub);
        URL.revokeObjectURL(urlPub);

        // --- DISPARAR DESCARGA CLAVE PRIVADA (.asc) ---
        setTimeout(() => {
            const blobPriv = new Blob([privateKey], { type: "text/plain;charset=utf-8" });
            const urlPriv = URL.createObjectURL(blobPriv);
            const linkPriv = document.createElement('a');
            linkPriv.href = urlPriv;
            linkPriv.download = `Clave_Privada_${nombreArchivo}_SECRETA.asc`; 
            document.body.appendChild(linkPriv);
            linkPriv.click();
            document.body.removeChild(linkPriv);
            URL.revokeObjectURL(urlPriv);
            
            alert(`🎉 ¡Llaves OpenPGP creadas con éxito con tus datos!\n\nYa puedes arrastrar el archivo "Clave_Publica_${nombreArchivo}.asc" dentro de Kleopatra.`);
        }, 600);

    } catch (error) {
        alert("Error al procesar llaves OpenPGP: " + error.message);
        console.error(error);
    }
}