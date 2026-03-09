const crypto = require('crypto');

const SECRET = process.env.JWT_SECRET || 'pagaska-secret-key-2024-change-in-production';

module.exports = {
  sign(payload) {
    try {
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
      const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString('base64url');
      const signature = crypto
        .createHmac('sha256', SECRET)
        .update(`${header}.${body}`)
        .digest('base64url');
      return `${header}.${body}.${signature}`;
    } catch (err) {
      console.error('JWT Sign Error:', err);
      throw new Error('Failed to sign token');
    }
  },

  verify(token) {
    try {
      if (!token || typeof token !== 'string') return null;
      
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const [header, body, signature] = parts;
      
      const expectedSig = crypto
        .createHmac('sha256', SECRET)
        .update(`${header}.${body}`)
        .digest('base64url');
      
      if (signature !== expectedSig) return null;
      
      const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
      
      // Check expiration (optional, 7 days)
      if (payload.iat && Date.now() - payload.iat > 7 * 24 * 60 * 60 * 1000) {
        return null;
      }
      
      return payload;
    } catch (err) {
      console.error('JWT Verify Error:', err);
      return null;
    }
  }
};
