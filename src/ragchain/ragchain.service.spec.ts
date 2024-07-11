import { Test, TestingModule } from '@nestjs/testing';
import { RagchainService } from './ragchain.service';

describe('RagchainService', () => {
  let service: RagchainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RagchainService],
    }).compile();

    service = module.get<RagchainService>(RagchainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
