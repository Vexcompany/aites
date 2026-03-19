// api/test-save.js
// TEMPORARY - hapus setelah selesai debug!
// Akses: https://domain.vercel.app/api/test-save

const { saveChat, getUserChats } = require('./_lib/db.js');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const results = { steps: [], error: null };

  try {
    // Step 1: test saveChat
    results.steps.push('1. Mencoba saveChat...');
    const fakeMessages = [
      { role: 'user', content: 'Test pesan dari debug' },
      { role: 'assistant', content: 'Test balasan dari AI' }
    ];
    const saved = await saveChat('debug_user', fakeMessages, 'pagaska');
    results.steps.push('2. saveChat berhasil: ' + saved.id);

    // Step 2: test getUserChats
    results.steps.push('3. Mencoba getUserChats...');
    const chats = await getUserChats('debug_user', 5);
    results.steps.push('4. getUserChats berhasil, jumlah: ' + chats.length);

    results.saved = saved;
    results.retrieved = chats.length + ' chat ditemukan';
    results.success = true;

  } catch (err) {
    results.error = err.message;
    results.stack = err.stack;
    results.success = false;
  }

  res.status(200).json(results);
};
