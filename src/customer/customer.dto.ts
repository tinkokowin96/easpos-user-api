import { SelectionTypeIf } from '@common/dto/core.dto';
import { IsMongoId, IsOptional } from 'class-validator';
import { IntersectionType, OmitType, PickType } from '@nestjs/swagger';
import { CreateUserDto } from '@shared/user/user.dto';
import Customer from './customer.schema';

export class AddCustomerAllowanceDto {
   @IsMongoId()
   customerId: string;

   @IsMongoId()
   allowanceId: string;
}

const guestPartial: Array<keyof CreateUserDto> = ['firstName', 'lastName', 'mail', 'mobileNo'];

export class CreateCustomerDto extends IntersectionType(
   OmitType(CreateUserDto, guestPartial),
   SelectionTypeIf((o) => !o.guest, CreateUserDto, guestPartial, true),
   PickType(Customer, ['guest']),
) {}

export class GetCustomerDto {
   @IsOptional()
   @IsMongoId()
   id?: string | ObjectId;
}
