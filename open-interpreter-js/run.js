const readline = require('readline');
const { OpenAI } = require("langchain/llms/openai");
const { BufferMemory } = require("langchain/memory");
const { ConversationChain } = require("langchain/chains");
const { monkPromptTemplate } = require('./prompt-templates');
const { parseResultToList } = require('./parser');

const model = new OpenAI({});
const memory = new BufferMemory();
const chain = new ConversationChain({ llm: model, memory: memory });
const starterPromptTemplate = monkPromptTemplate

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
            tryParse(res);
        } catch (e) {
            console.error(`Error in initial request: ${e.message}`);
            initalRequest();
        }
    });
}

function tryParse(result, failCallback) {
    try {
        const parsed = parseResultToList(result.response);
        console.log(parsed);
    } catch (e) {
        console.error(`Error on parsing result: ${e.message}`);
        failCallback();
    }
}

function main() {
    initalRequest();
}

main();