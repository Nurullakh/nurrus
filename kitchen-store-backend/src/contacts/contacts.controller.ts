import { Body, Controller, Post } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(@Body() createContactDto: CreateContactRequestDto) {
    return this.contactsService.create(createContactDto);
  }
}
