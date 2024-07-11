import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocStoreService } from 'src/doc-store/doc-store.service';
import { RagchainService } from './ragchain.service';
import { RagchainController } from './ragchain.controller';

@Module({
    imports :[],
    controllers : [RagchainController],
    providers: [{
        provide: DocStoreService,
        useFactory: async (configService: ConfigService) => {
            return await DocStoreService.initialize(configService)
        },
        inject: [ConfigService]
    },
    {
        provide: RagchainService,
        useFactory: async (docStore: DocStoreService, configService: ConfigService) => {
            return await RagchainService.initialize(docStore, configService)
        },
        inject: [DocStoreService, ConfigService]
    },
    ],
    exports : [DocStoreService]
})
export class RagchainModule {
    constructor(private readonly docStore: DocStoreService,
        public ragChain: RagchainService) {

    }

    public async addTextDoc(textDoc: { docArr: string[], source: string }) {
        return await this.docStore.addTextDoc(textDoc)
    }

}
