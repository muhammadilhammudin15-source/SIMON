const sqlite3 = require('sqlite3').verbose();
const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Database
const db = new sqlite3.Database('./simon.db', (err) => {
  if (err) {
    console.error("Gagal koneksi database:", err.message);
  } else {
    console.log("Database terhubung.");
  }
});

// Buat tabel jika belum ada
db.run(`
  CREATE TABLE IF NOT EXISTS laporan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tanggal TEXT,
    kelas TEXT,
    mapel TEXT,
    materi TEXT,
    jamMulai TEXT,
    jamSelesai TEXT,
    metode TEXT,
    kendala TEXT,
    kendalaLain TEXT,
    skala TEXT
  )
`);


// ======================
// ROUTE KIRIM
// ======================
app.post("/kirim", (req, res) => {

  const {
    kelas,
    mapel,
    materi,
    jamMulai,
    jamSelesai,
    metode,
    kendala,
    kendalaLainText,
    skala
  } = req.body;

  const tanggal = new Date().toISOString().split('T')[0]; // format YYYY-MM-DD

  db.run(`
    INSERT INTO laporan 
    (tanggal, kelas, mapel, materi, jamMulai, jamSelesai, metode, kendala, kendalaLain, skala)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  [
    tanggal,
    kelas,
    mapel,
    materi,
    jamMulai,
    jamSelesai,
    metode,
    kendala,
    kendalaLainText,
    skala
  ],
  function(err) {
    if (err) {
      console.error(err);
      return res.send("Terjadi kesalahan saat menyimpan data.");
    }

    res.send(`
      <h2>Laporan Berhasil Disimpan</h2>
      <a href="/">Kembali ke Form</a>
    `);
  });

});


// ======================
// ROUTE ADMIN
// ======================
app.get('/admin', (req, res) => {

  db.all("SELECT * FROM laporan ORDER BY id DESC", [], (err, rows) => {

    if (err) {
      console.error(err);
      return res.send("Error mengambil data.");
    }

    let html = `
    <html>
    <head>
      <title>Admin SIMON</title>
      <style>
        body { font-family: Arial; background:#f4f6f9; padding:30px; }
        .card {
          background:white;
          padding:15px;
          border-radius:8px;
          margin-bottom:15px;
          box-shadow:0 2px 6px rgba(0,0,0,0.1);
        }
        .hapus {
          background:#e74c3c;
          color:white;
          padding:6px 12px;
          border-radius:6px;
          text-decoration:none;
        }
      </style>
    </head>
    <body>
      <h2>Admin SIMON</h2>
      <p>Total Data: ${rows.length}</p>
      <a href="/">← Kembali</a>
      <hr>
    `;

    rows.forEach((row, index) => {
      html += `
        <div class="card">
          <b>${index + 1}. ${row.kelas}</b><br>
          Tanggal: ${row.tanggal}<br>
          Mapel: ${row.mapel}<br>
          Materi: ${row.materi}<br>
          Jam: ${row.jamMulai} - ${row.jamSelesai}<br>
          Metode: ${row.metode || "-"}<br>
          Kendala: ${row.kendala || "-"}<br>
          Skala: ${row.skala}<br><br>

          <a class="hapus" href="/hapus/${row.id}">Hapus</a>
        </div>
      `;
    });

    html += `</body></html>`;

    res.send(html);

  });

});


// ======================
// ROUTE HAPUS
// ======================
app.get('/hapus/:id', (req, res) => {

  const id = req.params.id;

  db.run("DELETE FROM laporan WHERE id = ?", [id], function(err) {
    if (err) {
      console.error(err);
    }
    res.redirect('/admin');
  });

});


// ======================
// JALANKAN SERVER
// ======================
app.listen(port, () => {
  console.log("Server jalan di port", port);
});