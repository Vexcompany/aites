// Simulasi database - untuk production gunakan Upstash Redis atau MongoDB
const users = new Map();
const chats = new Map();

// Data Generasi Pagaska (Pre-populated)
const pagaskaGenerations = {
  1: [
    { nama: "Ryan Yazid Hidayatullah", jabatan: "Ketua Umum" },
    { nama: "Sekar Rutikasari", jabatan: "Wakil Ketua Umum" },
    { nama: "Hudaifa Ulil", jabatan: "Sekretaris" },
    { nama: "Febyola", jabatan: "Bendahara" },
  ],
  2: [
    { nama: "Rizky Indra Permana", jabatan: "Ketua Umum" },
    { nama: "Dwi Bella Noviyanti", jabatan: "Wakil Ketua" },
    { nama: "Anastasya Putri Gianto", jabatan: "Sekretaris" }
  ],
  3: [
    { nama: "Afrizal", jabatan: "Ketua Umum" },
    { nama: "Fatimah Az-Zahra", jabatan: "Wakil Ketua" },
    { nama: "Nazuwa", jabatan: "Sekretaris" }
  ],
  4: [
    { nama: "Putri", jabatan: "Anggota", tipe: "gratis" },
    { nama: "Mariska", jabatan: "Anggota", tipe: "gratis" },
    { nama: "Yolanda", jabatan: "Anggota", tipe: "gratis" }
  ]
};

// Pre-register users dari generasi 1-3 (login: Nama + Jabatan)
[1, 2, 3].forEach(gen => {
  pagaskaGenerations[gen].forEach((user, idx) => {
    const id = `gen${gen}_${idx}`;
    users.set(id, {
      id,
      nama: user.nama,
      jabatan: user.jabatan,
      generasi: gen,
      tipe: 'jabatan',
      createdAt: new Date().toISOString()
    });
  });
});

// Pre-register generasi 4 (login: Anggota)
pagaskaGenerations[4].forEach((user, idx) => {
  const id = `gen4_${idx}`;
  users.set(id, {
    id,
    nama: user.nama,
    jabatan: user.jabatan,
    generasi: 4,
    tipe: 'gratis',
    createdAt: new Date().toISOString()
  });
});

module.exports = {
  users,
  chats,
  
  // Helper functions
  findUserByCredentials(nama, jabatan, generasi) {
    for (const [id, user] of users) {
      if (user.generasi !== parseInt(generasi)) continue;
      
      if (user.generasi === 4) {
        // Gen 4: cek jabatan = "Anggota"
        if (user.jabatan.toLowerCase() === jabatan.toLowerCase() && 
            user.nama.toLowerCase() === nama.toLowerCase()) {
          return user;
        }
      } else {
        // Gen 1-3: cek nama + jabatan
        if (user.nama.toLowerCase() === nama.toLowerCase() && 
            user.jabatan.toLowerCase() === jabatan.toLowerCase()) {
          return user;
        }
      }
    }
    return null;
  },

  saveChat(userId, messages) {
    const userChats = chats.get(userId) || [];
    const chatSession = {
      id: Date.now().toString(),
      userId,
      messages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    userChats.push(chatSession);
    chats.set(userId, userChats);
    return chatSession;
  },

  getUserChats(userId) {
    return chats.get(userId) || [];
  },

  deleteChat(userId, chatId) {
    const userChats = chats.get(userId) || [];
    const filtered = userChats.filter(c => c.id !== chatId);
    chats.set(userId, filtered);
    return true;
  }
};