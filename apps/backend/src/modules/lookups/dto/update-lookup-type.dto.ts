import { PartialType } from '@nestjs/swagger';
import { CreateLookupTypeDto } from './create-lookup-type.dto';

export class UpdateLookupTypeDto extends PartialType(CreateLookupTypeDto) {}
