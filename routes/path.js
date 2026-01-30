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
    let conn;
    try {
      conn = await pool.getConnection();
      // 1. Insertar la ruta sin imagen primero
      const insertResult = await conn.query(
        `INSERT INTO path (name, origin, end, difficulty, status, duration, elevation_gain, average_velocity, distance, route, is_public, created_by, path_photo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)` ,
        [name, origin, destination, difficulty, status, duration, elevation, velocity, distance, route, is_public === 'public' ? 1 : 0, created_by]
      );
      const pathId = insertResult.insertId;
      // 2. Si hay imagen, renombrar y actualizar
      console.log('req.file:', req.file);
      if (req.file) {
        const ext = path.extname(req.file.originalname);
        const newFileName = pathId + '_path' + ext;
        const newPath = path.join(__dirname, '../uploads', newFileName);
        fs.renameSync(req.file.path, newPath);
        path_photo = 'uploads/' + newFileName;
        await conn.query('UPDATE path SET path_photo = ? WHERE id = ?', [path_photo, pathId]);
      }
      conn.release();
      res.json({ success: true, id: pathId, path_photo });
    } catch (err) {
      if (conn) conn.release();
      res.status(500).json({ error: err.message });
    }
  });

  // Obtener todas las rutas públicas con el nombre del usuario creador
  router.get('/public', async (req, res) => {
    try {
      const conn = await pool.getConnection();
      const rows = await conn.query(`
        SELECT path.*, registereduser.username AS creator_username
        FROM path
        LEFT JOIN registereduser ON path.created_by = registereduser.id
        WHERE path.is_public = 1
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
      const rows = await conn.query('SELECT id, name FROM path WHERE is_public = 1');
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
      const sql = 'SELECT DISTINCT origin FROM path WHERE is_public = 1 AND origin LIKE ? ORDER BY origin LIMIT 10';
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
      const sql = 'SELECT DISTINCT end FROM path WHERE is_public = 1 AND end LIKE ? ORDER BY end LIMIT 10';
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
        SELECT path.*, registereduser.username AS creator_username
        FROM path
        LEFT JOIN registereduser ON path.created_by = registereduser.id
        WHERE path.id = ?
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
        'INSERT INTO rating (score, description, path_id, user_id) VALUES (?, ?, ?, ?)',
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
        SELECT rating.*, registereduser.username
        FROM rating
        LEFT JOIN registereduser ON rating.user_id = registereduser.id
        WHERE rating.path_id = ?
        ORDER BY rating.id DESC
      `, [id]);
      conn.release();
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

      // Editar una ruta por su ID
    router.put('/:id', upload.single('path_photo'), async (req, res) => {
      const { id } = req.params;
      const {
        name,
        origin,
        end,
        difficulty,
        status,
        duration,
        distance,
        elevation_gain,
        average_velocity,
        route,
        is_public
      } = req.body;
      let path_photo = null;
      let updateFields = [name, origin, end, difficulty, status, duration, distance, elevation_gain, average_velocity, route, is_public];
      let updateSql = `UPDATE path SET name=?, origin=?, end=?, difficulty=?, status=?, duration=?, distance=?, elevation_gain=?, average_velocity=?, route=?, is_public=?`;
      if (req.file) {
        const ext = path.extname(req.file.originalname);
        const newFileName = id + '_path' + ext;
        const newPath = path.join(__dirname, '../uploads', newFileName);
        fs.renameSync(req.file.path, newPath);
        path_photo = 'uploads/' + newFileName;
        updateSql += ', path_photo=?';
        updateFields.push(path_photo);
      }
      updateSql += ' WHERE id=?';
      updateFields.push(id);
      try {
        const conn = await pool.getConnection();
        const result = await conn.query(updateSql, updateFields);
        conn.release();
        if (result.affectedRows > 0) {
          res.json({ success: true, updated: true });
        } else {
          res.json({ success: false, updated: false, message: 'No se actualizó ningún dato. ¿Los valores son iguales?' });
        }
      } catch (err) {
        console.error('[ERROR UPDATE PATH]', err);
        res.status(500).json({ error: err.message });
      }
    });
  // Obtener todas las rutas creadas por un usuario
  router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const conn = await pool.getConnection();
      const rows = await conn.query('SELECT * FROM path WHERE created_by = ?', [userId]);
      conn.release();
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }); 

  // Actualizar solo la imagen de un path
  router.post('/:id/photo', upload.single('path_photo'), async (req, res) => {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se envió ninguna imagen.' });
    }
    try {
      const ext = path.extname(req.file.originalname);
      const newFileName = id + '_path' + ext;
      const newPath = path.join(__dirname, '../uploads', newFileName);
      fs.renameSync(req.file.path, newPath);
      const path_photo = 'uploads/' + newFileName;
      const conn = await pool.getConnection();
      await conn.query('UPDATE path SET path_photo = ? WHERE id = ?', [path_photo, id]);
      conn.release();
      res.json({ success: true, path_photo });
    } catch (err) {
      console.error('[ERROR UPDATE PATH PHOTO]', err);
      res.status(500).json({ success: false, message: 'Error al actualizar la imagen.' });
    }
  });
  
  return router;
};