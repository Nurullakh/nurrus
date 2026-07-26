import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdatePayoutStatusDto {
  @IsIn(['approved', 'paid', 'rejected'])
  status: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
