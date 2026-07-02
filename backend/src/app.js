require('./config/env'); // validate env vars before anything else

const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const path      = require('path');

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_WWW,
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin:      allowedOrigins,
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// ── Static file serving (uploaded CVs, logos) ─────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs:       15 * 60 * 1000, // 15 minutes
  max:            1000,
  standardHeaders: true,
  legacyHeaders:  false,
});

// Stricter limit for auth endpoints to slow brute-force attempts
const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             20,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { success: false, message: 'Too many requests, please try again later.' },
});

// ── Health check (exempt from rate limiting) ──────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() })
);

app.use('/api', generalLimiter);
app.use('/api/auth/login',           authLimiter);
app.use('/api/auth/register',        authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/offers',        require('./routes/offers'));
app.use('/api/applications',  require('./routes/applications'));
app.use('/api/profiles',      require('./routes/profiles'));
app.use('/api/companies',     require('./routes/companies'));
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));

app.use('/api/upload',        require('./routes/upload'));
app.use('/api/ai',            require('./routes/ai'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/analytics',     require('./routes/analytics'));

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message || err);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(err.status || 500).json({
    success: false,
    message: isDev ? (err.message || 'Internal Server Error') : 'An unexpected error occurred',
  });
});

module.exports = app;
