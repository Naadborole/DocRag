import { Inject, Injectable } from '@nestjs/common';
import { DocStoreService } from './doc-store/doc-store.service';
import { DocExtractService } from './doc-extract/doc-extract.service';
import { RagchainService } from './ragchain/ragchain.service';
import { RagchainModule } from './ragchain/ragchain.module';

@Injectable()
export class AppService {

  constructor(
    private readonly docStore: DocStoreService,
    private readonly docExtract: DocExtractService) { }

  getHello(): string {
    return 'Hello World!';
  }

  async getRecords() {
    return []
  }

  async addFileToStore(file: Express.Multer.File) {
    const textDoc: { docArr: string[], source: string } = await this.docExtract.combineText(await this.docExtract.extract(file.buffer, file.originalname))
    return await this.docStore.addTextDoc(textDoc)
  }

}
