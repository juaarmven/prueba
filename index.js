const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mariadb = require('mariadb');
const path = require('path');

const app = express();

// Log global para depuración de peticiones
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(bodyParser.json());

const pool = mariadb.createPool({
  host: '127.0.0.1',
  user: 'ProyectoSW2', // Cambia por tu usuario de MariaDB
  password: 'ProyectoSW2', // Cambia por tu contraseña
  database: 'bbp', // Cambia por el nombre de tu base de datos
  connectionLimit: 5
});

// Mueve la importación y uso del router de usuario al principio, antes de los endpoints duplicados
const userRoutes = require('./routes/user');
app.use('/api', userRoutes);

// Importa el router de rutas (Path) y pásale el pool
const pathRoutes = require('./routes/path')(pool);
app.use('/api/path', pathRoutes);

// Endpoint para obtener datos de usuario
app.get('/api/user/:id', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    conn.release();
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Servir archivos estáticos de uploads para imágenes de perfil
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, './frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './frontend/public/dashboard.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, './frontend/public/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, './frontend/public/register.html'));
});

app.get('/discover', (req, res) => {
  res.sendFile(path.join(__dirname, './frontend/public/discover.html'));
});

app.get('/path-register', (req, res) => {
  res.sendFile(path.join(__dirname, './frontend/public/register-path.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, './frontend/public/profile.html'));
});

app.get('/friends', (req, res) => {
  res.sendFile(path.join(__dirname, './frontend/public/friends.html'));
});

app.get('/paths', (req, res) => {
  res.sendFile(path.join(__dirname, './frontend/public/public-profile.html'));
});

app.get('/myfriends', (req, res) => {
  res.sendFile(path.join(__dirname, './frontend/public/my-friends.html'));
});

app.get('/path-details', (req, res) => {
  res.sendFile(path.join(__dirname, './frontend/public/path-details.html'));
});

app.get('/rate-path', (req, res) => {
  res.sendFile(path.join(__dirname, './frontend/public/rate-path.html'));
});


app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  const open = await import('open');
  await open.default(`http://localhost:${PORT}`);
});
