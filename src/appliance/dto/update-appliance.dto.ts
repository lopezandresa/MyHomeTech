import { PartialType } from '@nestjs/swagger';
import { CreateApplianceDto } from './create-appliance.dto';

export class UpdateApplianceDto extends PartialType(CreateApplianceDto) {}