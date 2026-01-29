
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de multer para guardar imágenes en /uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'path-' + unique + ext);
  }
});
const upload = multer({ storage });


module.exports = (pool) => {
  // Crear nueva ruta (Path) con imagen
  router.post('/', upload.single('path_photo'), async (req, res) => {
    const {
      name,
      origin,
      destination,
      difficulty,
      status,
      duration,
      elevation,
      velocity,
      distance,
      route,
      is_public,
      created_by
    } = req.body;
    let path_photo = null;
    if (req.file) {
      path_photo = 'uploads/' + req.file.filename;
    }
    try {
      const conn = await pool.getConnection();
      await conn.query(
        `INSERT INTO Path (name, origin, end, difficulty, status, duration, elevation_gain, average_velocity, distance, route, is_public, created_by, path_photo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
        [name, origin, destination, difficulty, status, duration, elevation, velocity, distance, route, is_public === 'public' ? 1 : 0, created_by, path_photo]
      );
      conn.release();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Obtener todas las rutas públicas con el nombre del usuario creador
  router.get('/public', async (req, res) => {
    try {
      const conn = await pool.getConnection();
      const rows = await conn.query(`
        SELECT Path.*, RegisteredUser.username AS creator_username
        FROM Path
        LEFT JOIN RegisteredUser ON Path.created_by = RegisteredUser.id
        WHERE Path.is_public = 1
      `);
      conn.release();
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Obtener solo los nombres de las rutas públicas
  router.get('/public/names', async (req, res) => {
    try {
      const conn = await pool.getConnection();
      const rows = await conn.query('SELECT id, name FROM Path WHERE is_public = 1');
      conn.release();
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


  // Autocompletar origins de rutas públicas
  router.get('/public/origins', async (req, res) => {
    const q = req.query.q || '';
    try {
      console.log('[AUTOCOMPLETE ORIGINS] Query:', q);
      const conn = await pool.getConnection();
      const sql = 'SELECT DISTINCT origin FROM Path WHERE is_public = 1 AND origin LIKE ? ORDER BY origin LIMIT 10';
      console.log('[AUTOCOMPLETE ORIGINS] SQL:', sql);
      const rows = await conn.query(sql, [`%${q}%`]);
      conn.release();
      console.log('[AUTOCOMPLETE ORIGINS] Result:', rows);
      res.json(rows.map(r => r.origin).filter(Boolean));
    } catch (err) {
      console.error('[AUTOCOMPLETE ORIGINS] ERROR:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Autocompletar destinations de rutas públicas
  router.get('/public/destinations', async (req, res) => {
    const q = req.query.q || '';
    try {
      console.log('[AUTOCOMPLETE DESTINATIONS] Query:', q);
      const conn = await pool.getConnection();
      const sql = 'SELECT DISTINCT end FROM Path WHERE is_public = 1 AND end LIKE ? ORDER BY end LIMIT 10';
      console.log('[AUTOCOMPLETE DESTINATIONS] SQL:', sql);
      const rows = await conn.query(sql, [`%${q}%`]);
      conn.release();
      console.log('[AUTOCOMPLETE DESTINATIONS] Result:', rows);
      res.json(rows.map(r => r.end).filter(Boolean));
    } catch (err) {
      console.error('[AUTOCOMPLETE DESTINATIONS] ERROR:', err);
      res.status(500).json({ error: err.message });
    }
  });

    // Obtener los datos de una ruta por su ID
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const conn = await pool.getConnection();
      const rows = await conn.query(`
        SELECT Path.*, RegisteredUser.username AS creator_username
        FROM Path
        LEFT JOIN RegisteredUser ON Path.created_by = RegisteredUser.id
        WHERE Path.id = ?
      `, [id]);
      conn.release();
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Path not found' });
      }
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

    // Guardar una valoración para una ruta
  router.post('/:id/rating', async (req, res) => {
    const { id } = req.params;
    const { score, description, user_id } = req.body;
    if (!score || !user_id) {
      return res.status(400).json({ error: 'score y user_id son obligatorios' });
    }
    try {
      const conn = await pool.getConnection();
      await conn.query(
        'INSERT INTO Rating (score, description, path_id, user_id) VALUES (?, ?, ?, ?)',
        [score, description, id, user_id]
      );
      conn.release();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

    // Obtener valoraciones de una ruta
  router.get('/:id/ratings', async (req, res) => {
    const { id } = req.params;
    try {
      const conn = await pool.getConnection();
      const rows = await conn.query(`
        SELECT Rating.*, RegisteredUser.username
        FROM Rating
        LEFT JOIN RegisteredUser ON Rating.user_id = RegisteredUser.id
        WHERE Rating.path_id = ?
        ORDER BY Rating.id DESC
      `, [id]);
      conn.release();
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};