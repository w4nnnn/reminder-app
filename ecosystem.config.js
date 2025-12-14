module.exports = {
    apps: [
        {
            name: 'wa-reminder-frontend',
            script: 'npm',
            args: 'start',
            cwd: './',
        },
        {
            name: 'wa-reminder-worker',
            script: 'npx',
            args: 'tsx scripts/whatsapp.ts',
            cwd: './',
            autorestart: true,
            cron_restart: '0 0 * * *',
        },
    ],
};
