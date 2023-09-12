const Interpreter = require('./package/interpreter'); // Import the Interpreter class

const interpreter = new Interpreter("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", {
    debug: true,
    maxRetry: 3
});
const input = "extract all email addresses from the website accenon.de and save it as emails.txt file"; // Input code to interpret
interpreter.execute(input)
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error.message);
    });