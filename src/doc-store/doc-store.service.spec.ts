import { Test, TestingModule } from '@nestjs/testing';
import { DocStoreService } from './doc-store.service';

describe('DocStoreService', () => {
  let service: DocStoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocStoreService],
    }).compile();

    service = module.get<DocStoreService>(DocStoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
