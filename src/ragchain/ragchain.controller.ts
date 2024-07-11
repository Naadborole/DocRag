import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { RagchainService } from './ragchain.service';
import { DocStoreService } from 'src/doc-store/doc-store.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('ragchain')
export class RagchainController {
    constructor(private readonly ragChainService: RagchainService,
        private readonly docStore: DocStoreService
    ) { }

    @Post("question")
    async postQuestion(@Body() data) {
        return await this.ragChainService.ask(data.question)
    }

}
