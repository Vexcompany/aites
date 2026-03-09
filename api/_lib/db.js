// Simulasi database - untuk production gunakan Upstash Redis atau MongoDB
const users = new Map();
const chats = new Map();

// Data Generasi Pagaska (Pre-populated)
const pagaskaGenerations = {
  1: [
    { nama: "Ryan Yazid Hidayat", jabatan: "Ketua Umum" },
    { nama: "Sekar Rutikasari", jabatan: "Wakil Ketua Umum" },
    { nama: "Hudaifa Ulil Albab", jabatan: "Sekretaris" },
    { nama: "Febyola Putri Yulianti", jabatan: "Bendahara" },
    { nama: "Rehan Raiszaki Muhfroni", jabatan: "Koor GK3" },
    { nama: "Yasir Isa", jabatan: "GK3" },
    { nama: "William Cristian Josepa", jabatan: "GK3" },
    { nama: "Dina Tri Handayani", jabatan: "GK3" },
    { nama: "Marsela Evi Novitasari", jabatan: "GK3" },
    { nama: "Naina Wulansari", jabatan: "Koor Disarda" },
    { nama: "Renata Putri Aurellia", jabatan: "Disarda" },
    { nama: "Dwi Yuliana Saputri", jabatan: "Disarda" },
    { nama: "Denis Putri Yuliana", jabatan: "Disarda" },
    { nama: "Ilham Bekti Pratama", jabatan: "Disarda" },
    { nama: "Nataly Reva Ayu Pradifa", jabatan: "Disarda" },
    { nama: "Amanda Amelia M", jabatan: "Disarda" },
    { nama: "Asiva Rizky Agustin", jabatan: "Disarda" },
    { nama: "Rizky Aditya", jabatan: "Koor Infokom" },
    { nama: "Nisrina Kirana Alya", jabatan: "Infokom" },
    { nama: "Amanda Fidda Reza Azzahara", jabatan: "Infokom" },
    { nama: "Salma Murni Indiannisa", jabatan: "Infokom" },
    { nama: "Zitkanisa Ullima", jabatan: "Infokom" },
  ],
  2: [
    { nama: "Rizky Indra Permana", jabatan: "Ketua Umum" },
    { nama: "Dwi Bella Noviyanti", jabatan: "Wakil Ketua" },
    { nama: "Anastasya Putri Gianto", jabatan: "Sekretaris" },
    { nama: "Khofifah Tabina Azka Listaningtyas", jabatan: "Bendahara" },
    { nama: "Satria Nur Hidayatullah", jabatan: "DTP" },
    { nama: "Reyna Natasya Wahyu Safitri", jabatan: "DTP" },
    { nama: "Ramzy Cahya Fauzan", jabatan: "Koor GK3" },
    { nama: "Sapta Andika Riyanto", jabatan: "GK3" },
    { nama: "Farhan Rizky Devannanda", jabatan: "GK3" },
    { nama: "Keisya Nabila", jabatan: "GK3" },
    { nama: "Tata Regita Juliana Putri", jabatan: "Koor Disarda" },
    { nama: "Amanda Regina Putri Yuditira", jabatan: "Disarda" },
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
    { nama: "Alisya Desvita Putri", jabatan: "Infokom" },
  ],
  3: [
    { nama: "Muhammad Afrizal Nurjananta", jabatan: "Ketua Umum" },
    { nama: "Fatimah Az-Zahra", jabatan: "Wakil Ketua Umum" },
    { nama: "Nazuwa Qurroti Aqyuni Hasna", jabatan: "Sekretaris" },
    { nama: "Asyifa Najwa Nabilla Putri", jabatan: "Sekretaris" },
    { nama: "Eva Devi Setyorini", jabatan: "Bendahara" },
    { nama: "Winni Lestari Arti Ningsih", jabatan: "Bendahara" },
    { nama: "Yoga Prasetyo Wibowo", jabatan: "DTP" },
    { nama: "Lelly Anggraini", jabatan: "DTP" },
    { nama: "Fahri Lintang Saputra, jabatan: "Koor GK3" },
    { nama: "Clarinta Jida Valery", jabatan: "GK3" },
    { nama: "Nur Azizah Lailatul Munawaroh", jabatan: "GK3" },
    { nama: "Violita Ayu Wardani", jabatan: "GK3" },
    { nama: "Aymel Oktavia Fitroh Masyaroh", jabatan: "GK3" },
    { nama: "Suci Rofiqoh", jabatan: "Koor Disarda" },
    { nama: "Nabila Kayyisa Putri", jabatan: "Disarda" },
    { nama: "Rolly Sadion Astyani", jabatan: "Disarda" },
    { nama: "Subhanifa Dwi Verbyanti", jabatan: "Disarda" },
    { nama: "Mariska Cahya Dwi Maulida", jabatan: "Disarda" },
    { nama: "Jahra' Anasula Farianto", jabatan: "Disarda" },
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
    { nama: "Janathan Hafiz Nugroho", jabatan: "Infokom" },
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

