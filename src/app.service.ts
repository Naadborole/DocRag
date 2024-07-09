import { Inject, Injectable } from '@nestjs/common';
import { DocStoreService } from './doc-store/doc-store.service';
import { DocExtractService } from './doc-extract/doc-extract.service';

@Injectable()
export class AppService {

  constructor(@Inject(DocStoreService) private readonly docStore: DocStoreService, private readonly docExtract: DocExtractService){}

  getHello(): string {
    return 'Hello World!';
  }

  async getTextFromFile(file: Buffer) {
    return this.docExtract.combineText(await this.docExtract.extract(file))
  }

  async addFileToStore(file : Buffer) {
    const textDoc : {docArr : string[], source : string} = await this.docExtract.combineText(await this.docExtract.extract(file))
    return this.docStore.addTextDoc(textDoc)
  }

}
