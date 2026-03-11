import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  create(@Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(createAddressDto);
  }

  @Get()
  findAll(@Query('userId') userId: string) {
    return this.addressesService.findAll(parseInt(userId, 10));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.addressesService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @Query('userId') userId?: string,
  ) {
    return this.addressesService.update(+id, updateAddressDto, userId ? parseInt(userId, 10) : undefined);
  }

  @Post(':id/set-default')
  setDefault(@Param('id') id: string, @Query('userId') userId: string) {
    return this.addressesService.setDefault(+id, parseInt(userId, 10));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('userId') userId?: string) {
    return this.addressesService.remove(+id, userId ? parseInt(userId, 10) : undefined);
  }
}
