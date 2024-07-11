import { Injectable } from '@nestjs/common';
import { DocStoreService } from 'src/doc-store/doc-store.service';
import { ChatPromptTemplate, MessagesPlaceholder, } from "@langchain/core/prompts";
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";

@Injectable()
export class RagchainService {

    public retriever
    public ragChain
    public chatHistory : any[]

    constructor(public docStore: DocStoreService, private readonly config: ConfigService) { }

    static async initialize(docStore: DocStoreService, conf: ConfigService) {

        let ragChainService = new RagchainService(docStore, conf)

        ragChainService.retriever = ragChainService.docStore.vectorStore.asRetriever();

        const qaSystemPrompt = `You are an assistant for question-answering tasks.
        Use the following pieces of retrieved context to answer the question.
        If you don't know the answer, just say that you don't know.
        {context}`;


        const prompt = ChatPromptTemplate.fromMessages([
            ["system", qaSystemPrompt],
            new MessagesPlaceholder("chat_history"),
            ["human", "{question}"],
        ]);

        const llm = ragChainService.getLLM()

        const contextualizeQSystemPrompt = `Given a chat history and the latest user question
        which might reference context in the chat history, formulate a standalone question
        which can be understood without the chat history. Do NOT answer the question,
        just reformulate it if needed and otherwise return it as is.`;

        const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
            ["system", contextualizeQSystemPrompt],
            new MessagesPlaceholder("chat_history"),
            ["human", "{question}"],
        ]);
        const contextualizeQChain = contextualizeQPrompt
            .pipe(llm)
            .pipe(new StringOutputParser());

        const contextualizedQuestion = (input: Record<string, any>) => {
            if ("chat_history" in input) {
                return contextualizeQChain;
            }
            return input.question;
        };

        ragChainService.ragChain = RunnableSequence.from([
            RunnablePassthrough.assign({
                context: (input: Record<string, any>) => {
                    if ("chat_history" in input) {
                        const chain = contextualizedQuestion(input);
                        return chain.pipe(ragChainService.retriever).pipe(formatDocumentsAsString);
                    }
                    return "";
                },
            }),
            prompt,
            llm,
        ]);
        ragChainService.chatHistory = []
        return ragChainService
    }

    private getLLM() {
        const type = this.config.get("LLM")
        switch (type) {
            case "GEMINI": {
                return new ChatGoogleGenerativeAI({
                    apiKey: this.config.get("GEMINI_API_KEY"),
                    modelName: "gemini-pro",
                    maxOutputTokens: 2048,
                    safetySettings: [
                        {
                            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                        },
                    ],
                });
            }
        }
    }

    public async ask(question: string){
        let chat_history = this.chatHistory
        const aiMsg = await this.ragChain.invoke({ question, chat_history });
        this.chatHistory = this.chatHistory.concat(aiMsg);
        return aiMsg
    }

}
