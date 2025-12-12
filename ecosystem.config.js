module.exports = {
    apps: [
        {
            name: 'next-app',
            script: 'npm',
            args: 'start',
        },
        {
            name: 'whatsapp-worker',
            script: 'scripts/whatsapp.ts',
            interpreter: 'node_modules/.bin/tsx',
            autorestart: true,
            restart_delay: 10000,
            max_restarts: 0,
        },
    ],
};

