// ==========================================
// 🔑 1. LÓGICA DE CIFRADO / DESCIFRADO AES (Simétrico)
// ==========================================

function cifrarAES() {
    const texto = document.getElementById('aes-plaintext').value;
    const clave = document.getElementById('aes-key').value;

    if (!texto || !clave) {
        alert("Por favor, rellena el texto y la clave secreta.");
        return;
    }

    // Cifrado usando CryptoJS
    const cifrado = CryptoJS.AES.encrypt(texto, clave).toString();
    document.getElementById('aes-ciphertext').value = cifrado;
}

function descifrarAES() {
    const cifrado = document.getElementById('aes-ciphertext-input').value;
    const clave = document.getElementById('aes-key-input').value;

    if (!cifrado || !clave) {
        alert("Por favor, introduce el texto cifrado y la clave.");
        return;
    }

    try {
        // Descifrado usando CryptoJS
        const bytes = CryptoJS.AES.decrypt(cifrado, clave);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);

        if (!originalText) throw new Error();
        
        document.getElementById('aes-recovered').innerText = originalText;
        document.getElementById('aes-recovered').style.color = "#10b981"; // Verde éxito
    } catch (error) {
        document.getElementById('aes-recovered').innerText = "❌ Error: Clave incorrecta o datos corruptos.";
        document.getElementById('aes-recovered').style.color = "#ef4444"; // Rojo error
    }
}


// ==========================================
// 🏢 2. LÓGICA DE CIFRADO / DESCIFRADO RSA (Asimétrico)
// ==========================================

// Función auxiliar para el paso previo en Decifrado.html
function generarLlavesRSA() {
    const crypt = new JSEncrypt({ default_key_size: 1024 });
    crypt.getKey();
    
    document.getElementById('generated-public').value = crypt.getPublicKey();
    document.getElementById('generated-private').value = crypt.getPrivateKey();
}

function cifrarRSA() {
    const texto = document.getElementById('rsa-plaintext').value;
    const publicKey = document.getElementById('rsa-public-key').value;

    if (!texto || !publicKey) {
        alert("Se requiere el texto y la clave pública del destinatario.");
        return;
    }

    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(publicKey);
    
    const cifrado = encryptor.encrypt(texto);
    
    if (!cifrado) {
        alert("Error: Asegúrate de que el formato de la clave pública sea válido.");
        return;
    }
    
    document.getElementById('rsa-ciphertext').value = cifrado;
}

function descifrarRSA() {
    const cifrado = document.getElementById('rsa-ciphertext-input').value;
    const privateKey = document.getElementById('rsa-private-key').value;

    if (!cifrado || !privateKey) {
        alert("Se requiere el texto cifrado y tu clave privada.");
        return;
    }

    const decryptor = new JSEncrypt();
    decryptor.setPrivateKey(privateKey);
    
    const originalText = decryptor.decrypt(cifrado);

    if (originalText) {
        document.getElementById('rsa-recovered').innerText = originalText;
        document.getElementById('rsa-recovered').style.color = "#10b981";
    } else {
        document.getElementById('rsa-recovered').innerText = "❌ Error: La clave privada no corresponde o el texto está alterado.";
        document.getElementById('rsa-recovered').style.color = "#ef4444";
    }
}