const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const secretKey = (process.env.SECRET_KEY || 'default_secret_key_1234567890123456').slice(0, 32); // Ensure 32-byte key
const iv = crypto.randomBytes(16);

// Function to encrypt text
const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

// Function to decrypt text
const decrypt = (text) => {
  const [ivHex, encryptedText] = text.split(':');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), Buffer.from(ivHex, 'hex'));
  let decrypted = decipher.update(Buffer.from(encryptedText, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

module.exports = { encrypt, decrypt };