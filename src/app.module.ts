import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { RagchainModule } from './ragchain/ragchain.module';
import { DocStoreService } from './doc-store/doc-store.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DocExtractService } from './doc-extract/doc-extract.service';
import { EmbeddingFactoryService } from './embedding-factory/embedding-factory.service';


@Module({
  imports: [ConfigModule.forRoot({isGlobal: true})],
  controllers: [AppController],
  providers: [AppService, {
    provide: DocStoreService,
    useFactory : async (configService: ConfigService) => {
      return await DocStoreService.initialize(configService)
    },
    inject : [ConfigService]
  }, DocExtractService, EmbeddingFactoryService],
})
export class AppModule {}
