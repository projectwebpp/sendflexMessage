const dotenv = require('dotenv');

dotenv.config();

const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

function normalizeSupabaseUrl(url) {
  return url.replace(/\/rest\/v1\/?$/, '');
}

const env = {
  port: Number(process.env.PORT) || 3001,
  supabaseUrl: normalizeSupabaseUrl(process.env.SUPABASE_URL),
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  allowedOrigin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
};

module.exports = env;
