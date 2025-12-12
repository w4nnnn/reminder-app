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
            autorestart: true,
            restart_delay: 30000,
            max_restarts: 0,
        },
    ],
};