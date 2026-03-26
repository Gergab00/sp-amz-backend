import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
// NOTE: Se aplicó formato con style=prettier (origen: configuración del proyecto)
