import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule} from '@nestjs/config';
import { DocExtractService } from './doc-extract/doc-extract.service';
import { RagchainModule } from './ragchain/ragchain.module';


@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), RagchainModule],
  controllers: [AppController],
  providers: [DocExtractService, AppService]
})
export class AppModule {  
}
