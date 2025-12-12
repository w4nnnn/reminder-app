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
            script: 'npm',
            args: 'run worker',
            autorestart: true,
            restart_delay: 30000,
            max_restarts: 0,
        },
    ],
};