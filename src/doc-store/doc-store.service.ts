import { Inject, Injectable } from '@nestjs/common';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PostgresRecordManager } from "@langchain/community/indexes/postgres";
import { index } from "langchain/indexes";
import { PGVectorStore, PGVectorStoreArgs } from "@langchain/community/vectorstores/pgvector";
import { PoolConfig } from "pg";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";


@Injectable()
export class DocStoreService {
    private config: PGVectorStoreArgs
    public vectorStore: PGVectorStore
    public recordManager: PostgresRecordManager
    public textSplitter: RecursiveCharacterTextSplitter
    private configService : ConfigService

    constructor(conf : ConfigService) {
        this.configService = conf
        this.config = {
            postgresConnectionOptions: {
                type: "postgres",
                host: this.configService.get("POSTGRES_HOST"),
                port: this.configService.get("POSTGRES_PORT"),
                user: this.configService.get("POSTGRES_USER"),
                password: this.configService.get("POSTGRES_PASSWORD"),
                database: "postgres",
            } as PoolConfig,
            tableName: "Docs",
            columns: {
                idColumnName: "id",
                vectorColumnName: "vector",
                contentColumnName: "content",
                metadataColumnName: "metadata",
            },
        };

        const recordManagerConfig = {
            postgresConnectionOptions: {
                type: "postgres",
                host: this.configService.get("POSTGRES_HOST"),
                port: this.configService.get("POSTGRES_PORT"),
                user: this.configService.get("POSTGRES_USER"),
                password: this.configService.get("POSTGRES_PASSWORD"),
                database: "postgres",
            } as PoolConfig,
            tableName: "recordsManger",
        };

        this.recordManager = new PostgresRecordManager(
            "test_namespace",
            recordManagerConfig
        );

        this.textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
    }

    static async initialize(configService) {
        const docStore = new DocStoreService(configService);
        const embedding = await docStore.createEmbedding("GEMINI")
        docStore.vectorStore = await PGVectorStore.initialize(embedding, docStore.config)
        await docStore.recordManager.createSchema();
        return docStore
    }

    public addDocuments = async (docs) => {
        return await index({
            docsSource: docs,
            recordManager: this.recordManager,
            vectorStore: this.vectorStore,
            options: {
                cleanup: "incremental",
                sourceIdKey: "source",
            },
        })
    }

    public async createEmbedding(type: string){
        switch(type){
            case "OPENAI":{
                return new OpenAIEmbeddings(this.configService.get("OPENAI_KEY"))
            }
            case "GEMINI":{
                return new GoogleGenerativeAIEmbeddings({
                    apiKey : this.configService.get("GEMINI_API_KEY"),
                    modelName : "embedding-001"
                })
            }
        }
    }

    public addText = async (text: string, source: string) => {
        const docs = await this.textSplitter.createDocuments([text], [{source: source}])
        return await this.addDocuments(docs)
    }

    public addTextDoc = async (textDoc: {docArr : string[], source : string}) => {
        const metadata = Array(textDoc.docArr.length).fill({source : textDoc.source})
        const docs = await this.textSplitter.createDocuments(textDoc.docArr, metadata)
        const ret =  await this.addDocuments(docs)
        return ret
    }
}