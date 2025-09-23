import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from './entities/faq.entity';
import { CreateFaqDto, UpdateFaqDto, AskDto, FaqResult, AskResponse } from './dto';

@Injectable()
export class FaqService {
  private readonly CONFIDENCE_THRESHOLD = 0.3;
  private readonly AMBIGUITY_THRESHOLD = 0.8;

  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,
  ) {}

  async create(createFaqDto: CreateFaqDto): Promise<Faq> {
    const faq = this.faqRepository.create(createFaqDto);
    return await this.faqRepository.save(faq);
  }

  async findAll(lang?: string): Promise<Faq[]> {
    const query = this.faqRepository.createQueryBuilder('faq');
    if (lang) {
      query.where('faq.lang = :lang', { lang });
    }
    return await query.getMany();
  }

  async findOne(id: number): Promise<Faq> {
    const faq = await this.faqRepository.findOne({ where: { id } });
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    return faq;
  }

  async update(id: number, updateFaqDto: UpdateFaqDto): Promise<Faq> {
    const faq = await this.findOne(id);
    Object.assign(faq, updateFaqDto);
    return await this.faqRepository.save(faq);
  }

  async remove(id: number): Promise<void> {
    const faq = await this.findOne(id);
    await this.faqRepository.remove(faq);
  }

  async ask(askDto: AskDto): Promise<AskResponse> {
    const { text, lang = 'en' } = askDto;
    
    // Get all FAQs for the specified language
    const faqs = await this.findAll(lang);
    
    if (faqs.length === 0) {
      return {
        results: [],
        message: "Not sure, please contact staff."
      };
    }

    // Score each FAQ
    const scoredFaqs = faqs.map(faq => ({
      ...faq,
      score: this.calculateScore(text, faq)
    }));

    // Filter by confidence threshold and sort by score
    const validFaqs = scoredFaqs
      .filter(faq => faq.score >= this.CONFIDENCE_THRESHOLD)
      .sort((a, b) => b.score - a.score);

    if (validFaqs.length === 0) {
      return {
        results: [],
        message: "Not sure, please contact staff."
      };
    }

    // Check for ambiguity
    const topScore = validFaqs[0].score;
    const closeMatches = validFaqs.filter(faq => 
      faq.score >= topScore * this.AMBIGUITY_THRESHOLD
    );

    // Group by tags to detect ambiguity across different categories
    const tagGroups = new Set(closeMatches.flatMap(faq => faq.tags));
    const isAmbiguous = tagGroups.size > 1 && closeMatches.length > 1;

    const results: FaqResult[] = (isAmbiguous ? closeMatches : validFaqs.slice(0, 3))
      .map(faq => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        tags: faq.tags,
        score: Math.round(faq.score * 100) / 100
      }));

    return {
      results,
      ambiguous: isAmbiguous || undefined
    };
  }

  private calculateScore(query: string, faq: Faq): number {
    const queryWords = this.tokenize(query.toLowerCase());
    const questionWords = this.tokenize(faq.question.toLowerCase());
    const answerWords = this.tokenize(faq.answer.toLowerCase());
    const tags = faq.tags.map(tag => tag.toLowerCase());

    // Keyword overlap scoring
    const questionOverlap = this.calculateOverlap(queryWords, questionWords);
    const answerOverlap = this.calculateOverlap(queryWords, answerWords);
    
    // Tag matching scoring
    const tagOverlap = this.calculateTagOverlap(queryWords, tags);

    // Weighted score calculation
    const keywordScore = (questionOverlap * 0.6 + answerOverlap * 0.2) / Math.max(queryWords.length, 1);
    const tagScore = tagOverlap * 0.2;

    return Math.min(keywordScore + tagScore, 1.0);
  }

  private tokenize(text: string): string[] {
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2); // Remove short words
  }

  private calculateOverlap(words1: string[], words2: string[]): number {
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = new Set([...set1].filter(word => set2.has(word)));
    return intersection.size;
  }

  private calculateTagOverlap(queryWords: string[], tags: string[]): number {
    let overlap = 0;
    for (const tag of tags) {
      const tagWords = this.tokenize(tag);
      overlap += this.calculateOverlap(queryWords, tagWords);
    }
    return overlap / Math.max(tags.length, 1);
  }
}