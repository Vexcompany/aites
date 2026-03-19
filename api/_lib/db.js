const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// ─── Redis REST helper ───────────────────────────────────────
async function redis(cmd, ...args) {
  if (!REDIS_URL || !REDIS_TOKEN) {
    throw new Error('Set UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN di Vercel environment variables');
  }
  const parts = [cmd, ...args.map(a =>
    typeof a === 'object' ? JSON.stringify(a) : String(a)
  )];
  const res = await fetch(`${REDIS_URL}/${parts.map(p => encodeURIComponent(p)).join('/')}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
  });
  const data = await res.json();
  if (data.error) throw new Error(`Redis error: ${data.error}`);
  return data.result;
}

const parse = v => { try { return JSON.parse(v); } catch { return v; } };

async function rGet(key)              { const v = await redis('GET', key); return v ? parse(v) : null; }
async function rSet(key, val)         { return redis('SET', key, JSON.stringify(val)); }
async function rDel(key)              { return redis('DEL', key); }
async function rLPush(key, val)       { return redis('LPUSH', key, JSON.stringify(val)); }
async function rLRange(key, s, e)     { const a = await redis('LRANGE', key, s, e); return (a||[]).map(parse); }
async function rLRem(key, cnt, val)   { return redis('LREM', key, cnt, JSON.stringify(val)); }
async function rSAdd(key, val)        { return redis('SADD', key, val); }
async function rSMembers(key)         { return (await redis('SMEMBERS', key)) || []; }
async function rLTrim(key, s, e)      { return redis('LTRIM', key, s, e); }

const MEMBERS = {
  1: [
    { nama: "Ryan Yazid Hidayat", jabatan: "Ketua Umum" },
    { nama: "Sekar Rutikasari", jabatan: "Wakil Ketua Umum" },
    { nama: "Hudaifa Uli Aibab", jabatan: "Sekretaris" },
    { nama: "Rebyola Putri Yulianti", jabatan: "Bendahara" },
    { nama: "Rehan Raiszaki Muhfroni", jabatan: "Koor GK3" },
    { nama: "Yasir Isa", jabatan: "GK3" },
    { nama: "William Cristian Josepa", jabatan: "GK3" },
    { nama: "Dina Tri Handayani", jabatan: "GK3" },
    { nama: "Marsela Evi Novitasari", jabatan: "GK3" },
    { nama: "Maina Wulansari", jabatan: "Koor Disarda" },
    { nama: "Renata Putri Aurellia", jabatan: "Disarda" },
    { nama: "Dwi Yuliana Saputri", jabatan: "Disarda" },
    { nama: "Denis Putri Yuliana", jabatan: "Disarda" },
    { nama: "Ilham Bekti Pratama", jabatan: "Disarda" },
    { nama: "Nataly Reva Ayu Pradifa", jabatan: "Disarda" },
    { nama: "Amanda Amelia W", jabatan: "Disarda" },
    { nama: "Asiva Rizky Ayustin", jabatan: "Disarda" },
    { nama: "Rizky Aditya", jabatan: "Koor Infokom" },
    { nama: "Nisrina Kirana Alya", jabatan: "Infokom" },
    { nama: "Amanda Fidda Reza Azzahara", jabatan: "Infokom" },
    { nama: "Salma Murni Indianissa", jabatan: "Infokom" },
    { nama: "Zitkanisa Ulina", jabatan: "Infokom" }
  ],
  2: [
    { nama: "Rizky Indra Permana", jabatan: "Ketua Umum" },
    { nama: "Dwi Bella Noviyanti", jabatan: "Wakil Ketua Umum" },
    { nama: "Anastasya Putri Gianto", jabatan: "Sekretaris" },
    { nama: "Khofifah Tabina Azka Listianingtyas", jabatan: "Bendahara" },
    { nama: "Satria Nur Hidayatullah", jabatan: "DTP" },
    { nama: "Reyna Natasya Wahyu Safitri", jabatan: "DTP" },
    { nama: "Ramzy Cahya Fauzan", jabatan: "Koor GK3" },
    { nama: "Sapta Andika Riyanto", jabatan: "GK3" },
    { nama: "Farhan Rizky Devannanda", jabatan: "GK3" },
    { nama: "Keisya Nabila", jabatan: "GK3" },
    { nama: "Tata Regita Juliana Putri", jabatan: "Koor Disarda" },
    { nama: "Amanda Regina Putri Yudithira", jabatan: "Disarda" },
    { nama: "Ailen Listiani", jabatan: "Disarda" },
    { nama: "Lael Rahmadhani", jabatan: "Disarda" },
    { nama: "Dea Alif Purwandini", jabatan: "Disarda" },
    { nama: "Rizky Dava Mahendra", jabatan: "Disarda" },
    { nama: "Alan Pratama", jabatan: "Disarda" },
    { nama: "Yohanes David Adhienarta Putra", jabatan: "Disarda" },
    { nama: "Aditya Dwi Pratama", jabatan: "Disarda" },
    { nama: "Alfarel Belva Falarossy", jabatan: "Disarda" },
    { nama: "Giovanni Adhi Pratama", jabatan: "Koor Infokom" },
    { nama: "Desy Ariana Putri", jabatan: "Infokom" },
    { nama: "Yusilla Anggun Vauli", jabatan: "Infokom" },
    { nama: "Alisya Desvita Putri", jabatan: "Infokom" }
  ],
  3: [
    { nama: "Muhammad Afrizal Nurjananta", jabatan: "Ketua Umum" },
    { nama: "Fatimah Az-Zahra", jabatan: "Wakil Ketua Umum" },
    { nama: "Nazwa Qurroti Aqyuni Hasna", jabatan: "Sekretaris" },
    { nama: "Asyifa Najwa Nabilla Putri", jabatan: "Sekretaris" },
    { nama: "Eva Devi Setyorini", jabatan: "Bendahara" },
    { nama: "Minni Lestari Arti Ningsih", jabatan: "Bendahara" },
    { nama: "Yoga Prasetyo Wibowo", jabatan: "DTP" },
    { nama: "Lelly Anggraini", jabatan: "DTP" },
    { nama: "Fahri Lintang Saputra", jabatan: "Koor GK3" },
    { nama: "Clarinta Jida Valery", jabatan: "GK3" },
    { nama: "Nur Azizah Lailatul Munawaroh", jabatan: "GK3" },
    { nama: "Violetta Ayu Wardani", jabatan: "GK3" },
    { nama: "Aymel Oktavia Fitroh Masyaroh", jabatan: "GK3" },
    { nama: "Suci Rofiqoh", jabatan: "Koor Disarda" },
    { nama: "Nabila Kayyisa Putri", jabatan: "Disarda" },
    { nama: "Rolly Sadion Aryani", jabatan: "Disarda" },
    { nama: "Subhanifa Dwi Yerbatyani", jabatan: "Disarda" },
    { nama: "Mariska Cahya Dwi Maulida", jabatan: "Disarda" },
    { nama: "Jahra Anasula Farianto", jabatan: "Disarda" },
    { nama: "Ella Rahmadani Elliana", jabatan: "Disarda" },
    { nama: "Silvia Nur Ramadhani", jabatan: "Disarda" },
    { nama: "Adly Surya Prasetiyo", jabatan: "Disarda" },
    { nama: "Meysa Desta Maharani", jabatan: "Disarda" },
    { nama: "Richy Yuga Tri Finalya", jabatan: "Koor Infokom" },
    { nama: "Anisa Apriliana Tunggal Dewi", jabatan: "Infokom" },
    { nama: "Bhilqis Tian Zahrotushita", jabatan: "Infokom" },
    { nama: "Az Zahrah Khanza Dewi Kuwais", jabatan: "Infokom" },
    { nama: "Nindia Artita Lestari", jabatan: "Infokom" },
    { nama: "Fahrel Akbar", jabatan: "Infokom" },
    { nama: "Janathan Hafiz Nugroho", jabatan: "Infokom" }
  ],
  4: [
    { nama: "Putri", jabatan: "Anggota", tipe: "gratis" },
    { nama: "Mariska", jabatan: "Anggota", tipe: "gratis" },
    { nama: "Yolanda", jabatan: "Anggota", tipe: "gratis" }
  ]
};

const ADMIN_NAMES = ['Richy Yuga Tri Finalya', 'Giovanni Adhi Pratama']; // ← EDIT INI

function makeUserId(nama, gen) {
  return `u:${gen}:${nama.toLowerCase().replace(/\s+/g,'_')}`;
}

// ─── Auth ────────────────────────────────────────────────────
async function findUserByCredentials(nama, jabatan, generasi) {
  const gen = parseInt(generasi);
  const namaTrim = nama.trim();
  const jabatanTrim = jabatan.trim();

  if (gen === 4) {
    if (jabatanTrim.toLowerCase() !== 'anggota') return null;
    const userId = makeUserId(namaTrim, 4);
    let user = await rGet(`user:${userId}`);
    if (!user) {
      user = {
        id: userId, nama: namaTrim, jabatan: 'Anggota',
        generasi: 4, tipe: 'gratis', isAdmin: false,
        createdAt: new Date().toISOString()
      };
      await rSet(`user:${userId}`, user);
      await rSAdd('idx:users', userId);
    }
    return user;
  }

  const list = MEMBERS[gen] || [];
  const match = list.find(
    m => m.nama.toLowerCase() === namaTrim.toLowerCase() &&
         m.jabatan.toLowerCase() === jabatanTrim.toLowerCase()
  );
  if (!match) return null;

  const userId = makeUserId(match.nama, gen);
  let user = await rGet(`user:${userId}`);
  if (!user) {
    user = {
      id: userId, nama: match.nama, jabatan: match.jabatan,
      generasi: gen, tipe: 'jabatan',
      isAdmin: ADMIN_NAMES.includes(match.nama),
      createdAt: new Date().toISOString()
    };
    await rSet(`user:${userId}`, user);
    await rSAdd('idx:users', userId);
  }
  return user;
}

async function getUserById(userId) {
  return rGet(`user:${userId}`);
}

// ─── Chat ────────────────────────────────────────────────────
async function saveChat(userId, messages, model) {
  const user = await rGet(`user:${userId}`);
  const chatId = `chat:${Date.now()}:${Math.random().toString(36).slice(2,6)}`;
  const chat = {
    id: chatId,
    userId,
    userName: user?.nama || userId,
    userGen: user?.generasi || '?',
    model: model || 'unknown',
    messages,
    preview: messages.find(m => m.role === 'user')?.content?.slice(0, 100) || '—',
    msgCount: messages.length,
    savedAt: new Date().toISOString()
  };

  await rSet(chatId, chat);
  await rLPush(`idx:chats:user:${userId}`, chatId);
  await rLTrim(`idx:chats:user:${userId}`, 0, 49);   // max 50 per user
  await rLPush('idx:chats:all', chatId);
  await rLTrim('idx:chats:all', 0, 999);              // max 1000 global

  return chat;
}

async function getUserChats(userId, limit = 30) {
  const ids = await rLRange(`idx:chats:user:${userId}`, 0, limit - 1);
  const chats = await Promise.all(ids.map(id => rGet(id)));
  return chats.filter(Boolean);
}

async function getAllChats(limit = 200) {
  const ids = await rLRange('idx:chats:all', 0, limit - 1);
  const chats = await Promise.all(ids.map(id => rGet(id)));
  return chats.filter(Boolean);
}

async function deleteChat(chatId) {
  const chat = await rGet(chatId);
  if (!chat) return false;
  await rDel(chatId);
  await rLRem(`idx:chats:user:${chat.userId}`, 0, chatId);
  await rLRem('idx:chats:all', 0, chatId);
  return true;
}

async function getAllUsers(limit = 200) {
  const ids = await rSMembers('idx:users');
  const users = await Promise.all(ids.slice(0, limit).map(id => rGet(`user:${id}`)));
  return users.filter(Boolean).sort((a,b) => (a.generasi - b.generasi));
}

module.exports = {
  findUserByCredentials,
  getUserById,
  saveChat,
  getUserChats,
  getAllChats,
  deleteChat,
  getAllUsers,
  ADMIN_NAMES,
};
