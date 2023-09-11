const { spawn } = require('child_process');
const readline = require('readline');
process.env.PYTHONIOENCODING = 'utf-8';

// Spawn the Python script
const pythonProcess = spawn('python', ['open-interpreter.py']);

// Create an interface for reading user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Listen for Python script's output
pythonProcess.stdout.on('data', (data) => {
    console.log(`Python Output: ${data}`);
});

// Listen for Python script's errors
pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
});

// Listen for Python script's exit
pythonProcess.on('exit', (code) => {
    console.log(`Python Process exited with code ${code}`);
    rl.close();
});

// Listen for user input and send it to the Python script
rl.on('line', (input) => {
    pythonProcess.stdin.write(input + '\n');
});

// Handle when the user closes the input stream
rl.on('close', () => {
    pythonProcess.stdin.end(); // Close the Python script's input stream
});
