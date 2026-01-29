const express = require('express');
const router = express.Router();
const mariadb = require('mariadb');
const { v4: uuidv4 } = require('uuid'); // Esto funcionará con uuid@8
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configuración de multer para guardar imágenes en /uploads con nombre temporal único
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    // Nombre temporal único usando timestamp y random
    const ext = path.extname(file.originalname);
    const tempName = 'temp_' + Date.now() + '_' + Math.floor(Math.random() * 10000) + ext;
    cb(null, tempName);
  }
});
const upload = multer({ storage });
const pool = mariadb.createPool({
  host: '127.0.0.1',
  user: 'ProyectoSW2',
  password: 'ProyectoSW2',
  database: 'bbp',
  connectionLimit: 5
});

console.log('Router de usuario cargado');

// Registro de usuario con imagen de perfil

router.post('/register', upload.single('profile_image'), async (req, res) => {
  const { name, last_name, age, location, email, password, phone, username } = req.body;
  let conn;
  try {
    conn = await pool.getConnection();
    // 1. Insertar en User y obtener el id generado
    const userResult = await conn.query('INSERT INTO User (user_type) VALUES (?)', ['Registered']);
    const userId = userResult.insertId;

    // 2. Procesar imagen de perfil si existe
    let imagePath = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newFileName = userId + '_profile' + ext;
      const newPath = path.join(__dirname, '../uploads', newFileName);
      // Renombra el archivo temporal al nombre definitivo
      fs.renameSync(req.file.path, newPath);
      imagePath = '/uploads/' + newFileName;
    }

    // 3. Insertar en RegisteredUser con el id generado
    await conn.query(
      'INSERT INTO RegisteredUser (id, name, last_name, age, location, profile_image, email, password, phone, username) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, last_name, age, location, imagePath, email, password, phone, username]
    );
    // Recupera el usuario recién creado para serializar correctamente phone
    const [user] = await conn.query('SELECT * FROM RegisteredUser WHERE id = ?', [userId]);
    if (user && typeof user.phone === 'bigint') {
      user.phone = user.phone.toString();
    }
    res.json({ success: true, id: userId, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Login de usuario
router.post('/login', async (req, res) => {

  const { email, password } = req.body;
  console.log('Login Recibido:', email, password);
  let conn;
  try {
    conn = await pool.getConnection();
    // IMPORTANTE: Usa el nombre correcto de la tabla y mayúsculas como en tu SQL
    const rows = await conn.query(
      'SELECT * FROM RegisteredUser WHERE email = ? AND password = ?',
      [email, password]
    );
    console.log('Resultado login:', rows);
    if (rows.length > 0) {
      // Convierte BigInt a string para evitar error de serialización
      if (typeof rows[0].phone === 'bigint') {
        rows[0].phone = rows[0].phone.toString();
      }
      res.json({ success: true, user: rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Error en login:', err); // <-- Log detallado de error
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Obtener usuario por id
router.get('/user/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM RegisteredUser WHERE id = ?', [req.params.id]);
    if (rows.length > 0) {
      // CORRECCIÓN: Si profile_image es un Buffer, devolver la ruta o un placeholder
      if (rows[0].profile_image && typeof rows[0].profile_image === 'object' && rows[0].profile_image.type === 'Buffer') {
        // Si tienes la ruta guardada en otro campo, úsala. Si no, pon el placeholder
        rows[0].profile_image = `/uploads/${rows[0].id}_profile.jpg`;
      } else if (!rows[0].profile_image) {
        rows[0].profile_image = '../assets/avatar-placeholder.png';
      }
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Actualizar datos de usuario
router.put('/user/:id', async (req, res) => {
  const { name, last_name, age, location, email, phone, username } = req.body;
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE RegisteredUser SET name=?, last_name=?, age=?, location=?, email=?, phone=?, username=? WHERE id=?',
      [name, last_name, age, location, email, phone, username, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Cambiar contraseña
router.put('/user/:id/password', async (req, res) => {
  const { password } = req.body;
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('UPDATE RegisteredUser SET password=? WHERE id=?', [password, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Cambiar imagen de perfil (subida de archivo)
router.post('/user/:id/profile_image', upload.single('profile_image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const imagePath = '/uploads/' + req.file.filename;
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('UPDATE RegisteredUser SET profile_image=? WHERE id=?', [imagePath, req.params.id]);
    res.json({ success: true, imagePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});
// Servir archivos estáticos de uploads
const uploadsPath = path.join(__dirname, '../uploads');
router.use('/uploads', express.static(uploadsPath));

// Eliminar usuario
router.delete('/user/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM RegisteredUser WHERE id=?', [req.params.id]);
    await conn.query('DELETE FROM User WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Buscar usuario por email o username
router.get('/user', async (req, res) => {
  const { email, username } = req.query;
  let conn;
  try {
    conn = await pool.getConnection();
    let rows = [];
    if (email) {
      rows = await conn.query('SELECT * FROM RegisteredUser WHERE email=?', [email]);
    } else if (username) {
      rows = await conn.query('SELECT * FROM RegisteredUser WHERE username=?', [username]);
    }
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Obtener número de rutas creadas por un usuario
router.get('/user/:id/paths/count', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT COUNT(*) as count FROM Path WHERE created_by = ?', [req.params.id]);
    let count = rows[0].count;
    // Si es BigInt, conviértelo a number
    if (typeof count === 'bigint') count = Number(count);
    console.log('Número de rutas para usuario', req.params.id, ':', count);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Obtener todos los usuarios registrados (id y username)
router.get('/all', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    let query = 'SELECT id, username, profile_image FROM RegisteredUser';
    const params = [];
    if (req.query.excludeId) {
      query += ' WHERE id != ?';
      params.push(req.query.excludeId);
    }
    const users = await conn.query(query, params);
    users.forEach(u => {
      if (!u.profile_image) u.profile_image = '../assets/avatar.png';
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Seguir a un usuario (añadir a UserFriends)
router.post('/follow', async (req, res) => {
  const { user_id, friend_id } = req.body;
  if (!user_id || !friend_id) {
    return res.status(400).json({ error: 'user_id y friend_id requeridos' });
  }
  let conn;
  try {
    conn = await pool.getConnection();
    // Evitar duplicados
    const exists = await conn.query('SELECT * FROM UserFriends WHERE user_id = ? AND friend_id = ?', [user_id, friend_id]);
    if (exists.length > 0) {
      return res.json({ success: false, error: 'Ya sigues a este usuario' });
    }
    await conn.query('INSERT INTO UserFriends (user_id, friend_id) VALUES (?, ?)', [user_id, friend_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Obtener lista de usuarios seguidos por un usuario (solo IDs de friend)
router.get('/:id/following', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT friend_id FROM UserFriends WHERE user_id = ?', [req.params.id]);
    // Devuelve solo un array de IDs
    const following = rows.map(r => r.friend_id);
    res.json(following);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Guardar like de ruta (UserLikesPath)
router.post('/userlikespath', async (req, res) => {
  const { user_id, path_id } = req.body;
  if (!user_id || !path_id) {
    return res.status(400).json({ error: 'user_id y path_id requeridos' });
  }
  let conn;
  try {
    conn = await pool.getConnection();
    // Evitar duplicados
    const exists = await conn.query('SELECT * FROM UserLikesPath WHERE user_id = ? AND path_id = ?', [user_id, path_id]);
    if (exists.length > 0) {
      return res.json({ success: false, error: 'Ya guardaste esta ruta' });
    }
    await conn.query('INSERT INTO UserLikesPath (user_id, path_id) VALUES (?, ?)', [user_id, path_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Obtener los path_id guardados por un usuario
router.get('/userlikespath/:user_id', async (req, res) => {
  const { user_id } = req.params;
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT path_id FROM UserLikesPath WHERE user_id = ?', [user_id]);
    // Devuelve solo un array de IDs
    const liked = rows.map(r => r.path_id);
    res.json(liked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
