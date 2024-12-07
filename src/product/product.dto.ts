import { IsMongoId, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { CoreDto } from '@common/dto/core.dto';
import { OmitType } from '@nestjs/swagger';
import Product from './product.schema';
import { CategoryDto } from '@common/dto/action.dto';
import { Type } from 'class-transformer';
import { Amount, BasicInfo } from '@common/dto/entity.dto';
import StockUnit from '../stock_unit/stock_unit.schema';

export class CreateProductDto extends OmitType(CoreDto(Product), ['category']) {
   @IsOptional()
   @ValidateNested({ each: true })
   @Type(() => CategoryDto)
   tags?: CategoryDto[];

   @ValidateNested({ each: true })
   @Type(() => OmitType(CategoryDto, ['type']))
   category: CategoryDto;

   @IsOptional()
   @IsMongoId()
   unitId: string;
}

export class StockUnitFullDto {
   @ValidateNested()
   @Type(() => StockUnit)
   stock: StockUnit;

   @IsNumber()
   quantity: Amount;
}

class ProductVariantCompactDto extends BasicInfo {
   @ValidateNested({ each: true })
   @Type(() => Array<StockUnitFullDto>)
   units: Array<StockUnitFullDto>;
}

export class ProductCompactDto extends BasicInfo {
   @ValidateNested()
   @Type(() => ProductVariantCompactDto)
   variant: ProductVariantCompactDto;
}
