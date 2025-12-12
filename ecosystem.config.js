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
            max_memory_restart: '500M',
            // Long-running process, no restart_delay needed
        },
    ],
};
