module.exports = {
  apps: [{
    name: 'bizmanager',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p ' + (process.env.PORT || 3000),
    cwd: './',
    env: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3000,
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://bizmanager:secretpassword@localhost:5432/bizmanager'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3000,
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://bizmanager:secretpassword@localhost:5432/bizmanager'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}