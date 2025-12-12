module.exports = {
    apps: [
        {
            name: 'next-app',
            script: 'npm',
            args: 'start',
            cwd: './',
        },
        {
            name: 'whatsapp-worker',
            script: 'npx',
            args: 'tsx scripts/whatsapp.ts',
            autorestart: true,
            restart_delay: 30000,
            max_restarts: 0,
        },
    ],
};