// Simple JWT implementation tanpa library
const crypto = require('crypto');

const SECRET = process.env.JWT_SECRET || 'pagaska-secret-key-2024';

module.exports = {
  sign(payload) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString('base64url');
    const signature = crypto
      .createHmac('sha256', SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
    return `${header}.${body}.${signature}`;
  },

  verify(token) {
    try {
      const [header, body, signature] = token.split('.');
      const expectedSig = crypto
        .createHmac('sha256', SECRET)
        .update(`${header}.${body}`)
        .digest('base64url');
      
      if (signature !== expectedSig) return null;
      
      return JSON.parse(Buffer.from(body, 'base64url').toString());
    } catch {
      return null;
    }
  }
};