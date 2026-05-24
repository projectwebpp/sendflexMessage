const { createClient } = require('@supabase/supabase-js')

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_ANON_KEY']
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
})

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

module.exports = supabase
