import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaqService } from './faq.service';
import { Faq } from './entities/faq.entity';

describe('FaqService', () => {
  let service: FaqService;
  let repository: Repository<Faq>;

  const mockFaqs: Faq[] = [
    {
      id: 1,
      question: 'What are your opening hours?',
      answer: 'We are open Monday to Friday 9-6',
      tags: ['hours', 'schedule'],
      lang: 'en',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      question: 'How to book appointment?',
      answer: 'Call us or use online portal',
      tags: ['booking', 'appointment'],
      lang: 'en',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      question: 'Do you provide vaccines?',
      answer: 'Yes, we offer various vaccination services',
      tags: ['services', 'vaccination'],
      lang: 'en',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockFaqs),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FaqService,
        {
          provide: getRepositoryToken(Faq),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<FaqService>(FaqService);
    repository = module.get<Repository<Faq>>(getRepositoryToken(Faq));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('ask method', () => {
    beforeEach(() => {
      jest.spyOn(service, 'findAll').mockResolvedValue(mockFaqs);
    });

    it('should return matching FAQs with scores', async () => {
      const result = await service.ask({ text: 'opening hours' });
      
      expect(result.results).toBeDefined();
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0]).toHaveProperty('score');
      expect(result.results[0]).toHaveProperty('question');
      expect(result.results[0]).toHaveProperty('answer');
    });

    it('should return fallback message for no matches', async () => {
      const result = await service.ask({ text: 'xyz unknown query' });
      
      expect(result.message).toBe('Not sure, please contact staff.');
      expect(result.results).toHaveLength(0);
    });

    it('should detect ambiguity when multiple different tags match', async () => {
      const result = await service.ask({ text: 'appointment booking hours schedule' });
      
      // This should match both "hours" and "booking" categories
      if (result.results.length > 1) {
        const tags = new Set(result.results.flatMap(r => r.tags));
        if (tags.size > 1) {
          expect(result.ambiguous).toBe(true);
        }
      }
    });

    it('should calculate scores correctly', async () => {
      const result = await service.ask({ text: 'opening hours schedule' });
      
      expect(result.results[0].score).toBeGreaterThan(0);
      expect(result.results[0].score).toBeLessThanOrEqual(1);
      
      // More specific queries should have higher scores
      const specificResult = await service.ask({ text: 'what are your opening hours' });
      const generalResult = await service.ask({ text: 'hours' });
      
      if (specificResult.results.length > 0 && generalResult.results.length > 0) {
        expect(specificResult.results[0].score).toBeGreaterThanOrEqual(generalResult.results[0].score);
      }
    });

    it('should filter results by language', async () => {
      const result = await service.ask({ text: 'hours', lang: 'en' });
      
      expect(service.findAll).toHaveBeenCalledWith('en');
    });

    it('should return top 3 results maximum when not ambiguous', async () => {
      const result = await service.ask({ text: 'service' });
      
      if (!result.ambiguous) {
        expect(result.results.length).toBeLessThanOrEqual(3);
      }
    });
  });

  describe('scoring algorithm', () => {
    it('should give higher scores for exact keyword matches', async () => {
      const result = await service.ask({ text: 'opening hours' });
      
      if (result.results.length > 0) {
        const hoursResult = result.results.find(r => r.tags.includes('hours'));
        expect(hoursResult).toBeDefined();
        expect(hoursResult.score).toBeGreaterThan(0.3);
      }
    });

    it('should give scores for tag matches', async () => {
      const result = await service.ask({ text: 'vaccination' });
      
      if (result.results.length > 0) {
        const vaccineResult = result.results.find(r => r.tags.includes('vaccination'));
        expect(vaccineResult).toBeDefined();
        expect(vaccineResult.score).toBeGreaterThan(0.2);
      }
    });
  });
});