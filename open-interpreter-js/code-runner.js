
const { spawn } = require('child_process');
const globalState = {};

async function executeNodeCodeInline(code) {
    return new Promise(async (resolve, reject) => {
        const state = globalState;

        const asyncCode = `
        (async () => {
            ${code}
        }
        )();
        `;

        const nodeProcess = spawn('node', ['-e', asyncCode]);

        nodeProcess.stdout.on('data', (data) => {
            resolve(data)
        });

        nodeProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
            reject(data)
        });

        nodeProcess.on('error', (code) => {
            resolve(code);
        });
    });
}


async function executeNodeCodeEval(code) {
    return new Promise(async (resolve, reject) => {
        try {
            const state = globalState;

            console.log = (...args) => {
                resolve(...args)
            };

            const asyncCode = `
            (async () => {
                ${code}
            }
            )();
            `;

            console.log('Executing code:', asyncCode);
            await eval(asyncCode);
            resolve();
        } catch (error) {
            console.error('Error executing code:', error);
            reject(error);
        }
    });
}

const runNpmCommand = (command, timeout = 300000) => {
    return new Promise((resolve, reject) => {
        const child = spawn(command, { shell: true, stdio: 'inherit' });

        child.on('exit', (code, signal) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command exited with code ${code} and signal ${signal}`));
            }
        });

        setTimeout(() => {
            child.kill();
            reject(new Error('Command execution timed out.'));
        }, timeout);
    });
};

module.exports = {
    executeNodeCodeEval,
    executeNodeCodeInline,
    runNpmCommand
};