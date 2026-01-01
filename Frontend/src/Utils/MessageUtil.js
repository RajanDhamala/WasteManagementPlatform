function base64ToArrayBuffer(base64) {
  base64 = base64.trim();
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function encryptMessage(message, recipientPublicKeyBase64, myPrivateKeyBase64) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  // Import keys
  const myPrivateKey = await crypto.subtle.importKey(
    "pkcs8",
    base64ToArrayBuffer(myPrivateKeyBase64),
    { name: "ECDH", namedCurve: "P-256" },
    false,
    ["deriveKey"]
  );

  const recipientPublicKey = await crypto.subtle.importKey(
    "spki",
    base64ToArrayBuffer(recipientPublicKeyBase64),
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // Derive shared secret key (AES-GCM 256)
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: recipientPublicKey,
    },
    myPrivateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  // Encrypt
  const iv = crypto.getRandomValues(new Uint8Array(12)); 
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    derivedKey,
    data
  );

  return {
    iv: arrayBufferToBase64(iv.buffer),
    ciphertext: arrayBufferToBase64(encrypted),
  };
}


async function decryptMessage(encryptedData, senderPublicKeyBase64, myPrivateKeyBase64) {
  const { iv: ivBase64, ciphertext: ciphertextBase64 } = encryptedData;

  // Import keys
  const myPrivateKey = await crypto.subtle.importKey(
    "pkcs8",
    base64ToArrayBuffer(myPrivateKeyBase64),
    { name: "ECDH", namedCurve: "P-256" },
    false,
    ["deriveKey"]
  );

  const senderPublicKey = await crypto.subtle.importKey(
    "spki",
    base64ToArrayBuffer(senderPublicKeyBase64),
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // Derive shared secret key
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: senderPublicKey,
    },
    myPrivateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  // Decrypt
  const iv = base64ToArrayBuffer(ivBase64);
  const ciphertext = base64ToArrayBuffer(ciphertextBase64);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    derivedKey,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

    const getAvatarColor = (name) => {
    if (!name) return "bg-gray-300";
    const colors = [
      "bg-green-500",
      "bg-blue-500",
      "bg-orange-500",
      "bg-emerald-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-amber-600",
      "bg-yellow-500",
      "bg-teal-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

    const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

    const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

    const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };



export {
    encryptMessage,
    decryptMessage,
    getAvatarColor,
    formatTime,
    getInitials,
    formatDate,
}
