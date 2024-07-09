import { Test, TestingModule } from '@nestjs/testing';
import { DocExtractService } from './doc-extract.service';

describe('DocExtractService', () => {
  let service: DocExtractService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocExtractService],
    }).compile();

    service = module.get<DocExtractService>(DocExtractService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
