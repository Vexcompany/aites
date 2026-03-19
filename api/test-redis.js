// api/test-redis.js
// TEMPORARY - hapus setelah selesai debug!
// Akses via: https://domain-kamu.vercel.app/api/test-redis

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
  const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  const results = {
    env: {
      UPSTASH_REDIS_REST_URL:   REDIS_URL   ? '✅ ada (' + REDIS_URL.slice(0,30) + '...)' : '❌ TIDAK ADA',
      UPSTASH_REDIS_REST_TOKEN: REDIS_TOKEN ? '✅ ada'                                      : '❌ TIDAK ADA',
    },
    ping: null,
    set: null,
    get: null,
    error: null
  };

  if (!REDIS_URL || !REDIS_TOKEN) {
    results.error = 'Env vars belum diset di Vercel';
    return res.status(200).json(results);
  }

  try {
    // PING
    const pingRes = await fetch(`${REDIS_URL}/PING`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
    });
    const pingData = await pingRes.json();
    results.ping = pingData.result === 'PONG' ? '✅ PONG' : '❌ ' + JSON.stringify(pingData);

    // SET
    const setRes = await fetch(`${REDIS_URL}/SET/debug:test/hello123`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
    });
    const setData = await setRes.json();
    results.set = setData.result === 'OK' ? '✅ OK' : '❌ ' + JSON.stringify(setData);

    // GET
    const getRes = await fetch(`${REDIS_URL}/GET/debug:test`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
    });
    const getData = await getRes.json();
    results.get = getData.result === 'hello123' ? '✅ hello123' : '❌ ' + JSON.stringify(getData);

  } catch (err) {
    results.error = err.message;
  }

  res.status(200).json(results);
};
