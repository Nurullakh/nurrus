import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { NewsletterSubscription } from './newsletter.entity';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(NewsletterSubscription)
    private readonly newsletterRepository: Repository<NewsletterSubscription>,
  ) {}

  async subscribe(subscribeDto: SubscribeNewsletterDto) {
    const normalizedEmail = subscribeDto.email.trim().toLowerCase();
    const source = subscribeDto.source?.trim() || 'homepage';

    const existing = await this.newsletterRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        existing.source = source;
        await this.newsletterRepository.save(existing);
      }

      return {
        id: existing.id,
        status: 'already_subscribed',
        message: 'Email уже подписан на рассылку.',
      };
    }

    const created = this.newsletterRepository.create({
      email: normalizedEmail,
      source,
      isActive: true,
    });

    const saved = await this.newsletterRepository.save(created);

    return {
      id: saved.id,
      status: 'subscribed',
      message: 'Подписка оформлена. Спасибо!',
    };
  }
}

