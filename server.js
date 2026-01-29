// Proxy para Nominatim (OpenStreetMap)
let fetch;
try {
  fetch = require('node-fetch');
} catch (e) {
  fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
}

app.get('/api/nominatim', async (req, res) => {
  const q = req.query.q;
  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter q' });
  }
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(q)}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'YourAppName/1.0 (your@email.com)'
      }
    });
    if (!response.ok) {
      return res.status(502).json({ error: 'Nominatim error' });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mariadb = require('mariadb');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configura tu pool de conexión
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'tu_usuario',
  password: 'tu_password',
  database: 'tu_basededatos',
  connectionLimit: 5
});

// Endpoint de registro
app.post('/api/register', async (req, res) => {
  const { email, password, name, age, city, phone } = req.body;
  try {
    const conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO users (email, password, name, age, city, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [email, password, name, age, city, phone]
    );
    conn.release();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint de login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
    conn.release();
    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

app.listen(3000, () => console.log('API running on http://localhost:3000'));