// RUTA: /src/modules/listing/interface/middlewares/validate-listing-item.middleware.ts

import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { validateSync } from 'class-validator';
import { UpdateListingItemDto } from '../http/dto/update-listing-item.request-dto.interface';
import { PatchListingItemDto } from '../http/dto/patch-listing-item.request-dto.interface';

/**
 * Middleware para validar el DTO de actualización de ítems en el listado.
 */
@Injectable()
export class ValidateListingItemMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    let dto;

    if (req.url.includes('patch')) {
      dto = Object.assign(new PatchListingItemDto(), req.body);
    } else {
      dto = Object.assign(new UpdateListingItemDto(), req.body);
    }

    const errors = validateSync(dto);

    if (errors.length > 0) {
      const errorMessages = errors
        .map((err) => Object.values(err.constraints || {}).join(', '))
        .join('; ');
      throw new BadRequestException(`Validación fallida: ${errorMessages}`);
    }

    req.validatedBody = dto; // Agrega el DTO validado al request
    next();
  }
}
