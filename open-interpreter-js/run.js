const readline = require('readline');
const { OpenAI } = require("langchain/llms/openai");
const { BufferMemory } = require("langchain/memory");
const { ConversationChain } = require("langchain/chains");
const { monkPromptTemplate, errorPromptTemplate } = require('./prompt-templates');
const { parseResultToList } = require('./parser');
const { runNpmCommand, executeNodeCodeInline, executeNodeCodeEval } = require('./code-runner');

const model = new OpenAI({
    modelName: "gpt-3.5-turbo",
    openAIApiKey: process.env.OPENAI_API_KEY || "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"
});
const memory = new BufferMemory();
const chain = new ConversationChain({ llm: model, memory: memory });
const starterPromptTemplate = monkPromptTemplate;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function askPrompt(callback) {
    rl.question("Make a request : ", (answer) => {
        callback(answer);
    });
}

function initalRequest() {
    askPrompt(async (prompt) => {
        try {
            const res = await chain.call({ input: starterPromptTemplate + prompt });
            tryParse(res, (result) => {
                console.log("======= Initial Plan =======", result);
                proceedResult(result);
            }, (r) => { });
        } catch (e) {
            console.error(`Error in initial request: ${e.message}`);
            memory.chatHistory.addUserMessage('Error: ' + getFirstLineOfError(e.message));
        }
    });
}
let retries = 0;
async function proceedResult(parsed) {
    try {
        for (let parsedItem of parsed) {
            if (parsedItem.isText) {
                console.log("======= Info =======");
                console.log(parsedItem.txt);
                continue;
            }

            if (parsedItem.txt.startsWith('npm') || parsedItem.txt.includes('npm install') || parsedItem.txt.includes('npm i')) {
                console.log("======= Npm execution =======");
                console.log(parsedItem.txt);
                await runNpmCommand(parsedItem.txt);
                continue;
            }

            console.log("======= Code execution =======");
            console.log(parsedItem.txt);
            await executeNodeCodeEval(parsedItem.txt);
            continue;
        }
    } catch (e) {
        const message = e.message ? getFirstLineOfError(e.message) : e;
        console.error(`Error in proceedResult: ${message}`);
        memory.chatHistory.addUserMessage('Error while trying to execute code: ' + message);
        fixError();
    }
}

async function fixError(retry = 0) {
    try {

        if (retry > 3) {
            console.error('=== Too many retries ===');
            return;
        }

        const res = await chain.call({ input: errorPromptTemplate });
        console.log("=======New Plan===========", res.response);
        tryParse(res, (result) => {
            proceedResult(result);
        }, () => { fixError(retry + 1); });
    } catch (e) {
        console.error(`====== Error in fixing: ${e.message}`);
        memory.chatHistory.addUserMessage('Error in while fixing: ' + getFirstLineOfError(e.message));
        fixError(retry + 1);
    }
}

function getFirstLineOfError(error) {
    return error.split('\n')[0];
}

function tryParse(result, callback, failCallback) {
    try {
        const parsed = parseResultToList(result.response);
        callback(parsed);
    } catch (e) {
        console.error(`Error on parsing result: ${e.message}`);
        failCallback();
    }
}

function main() {
    initalRequest();
}

main();