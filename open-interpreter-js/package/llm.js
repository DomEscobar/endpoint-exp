const { OpenAI } = require("langchain/llms/openai");
const { BufferMemory, ChatMessageHistory, BufferWindowMemory } = require("langchain/memory");
const { ConversationChain } = require("langchain/chains");
const { AIMessage, SystemMessage } = require("langchain/schema");

class LangChainLLM {
    constructor(options = { apiKey, modelName: "gpt-3.5-turbo", maxHistory: 7 }) {
        this.maxHistory = options.maxHistory;
        this.history = [];
        this.model = new OpenAI({
            modelName: options.modelName,
            openAIApiKey: options.apiKey,
        });
        this.memory = new BufferWindowMemory({ size: 7 });
        this.chain = new ConversationChain({ llm: this.model, memory: this.memory, verbose: true });
        this.initalPrompt = null;
    }

    async execute(input) {
        try {

            if (!this.initalPrompt) {
                this.initalPrompt = input;
            }

            const res = await this.chain.call({ input });
            return res;
        } catch (e) {
            throw new Error(`Error in execution: ${e.message}`);
        }
    }

    addSystemMessage(message) {
        this.addMessage(new SystemMessage({ content: message }));
    }

    addResult(message) {
        this.addMessage(new AIMessage({ content: message }));
    }

    addMessage(message) {
        this.history.push(message);
        this.memory.chatHistory.addMessage(message);
        this.removeLatestOnOverflow();
    }

    removeLatestOnOverflow() {
        if (this.history.length > this.maxHistory) {
            this.history.shift();
            this.memory.chatHistory.clear();
            this.memory.chatHistory = new ChatMessageHistory([this.initalPrompt, ...this.history])
        }
    }
}

module.exports = LangChainLLM;