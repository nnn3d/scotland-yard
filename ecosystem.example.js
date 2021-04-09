module.exports = {
  apps: [
    {
      name: 'sy',
      script: './src/prod.ts',
      cwd: './sy/packages/server',
      interpreter_args: '-r tsconfig-paths/register',
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm',
      env: {
        NODE_ENV: 'production',
        NODE_PATH: './src',
        JWT_SECRET: 'JWT_SECRET',
      },
    },
  ],
}
