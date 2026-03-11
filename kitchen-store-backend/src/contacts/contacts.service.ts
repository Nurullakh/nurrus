import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';
import { ContactRequest } from './contacts.entity';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(ContactRequest)
    private readonly contactsRepository: Repository<ContactRequest>,
  ) {}

  async create(createContactDto: CreateContactRequestDto) {
    const payload = this.contactsRepository.create({
      name: createContactDto.name.trim(),
      email: createContactDto.email.trim(),
      phone: createContactDto.phone?.trim() || undefined,
      subject: createContactDto.subject.trim(),
      message: createContactDto.message.trim(),
    });

    const saved = await this.contactsRepository.save(payload);

    return {
      id: saved.id,
      createdAt: saved.createdAt,
      message: 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.',
    };
  }
}
