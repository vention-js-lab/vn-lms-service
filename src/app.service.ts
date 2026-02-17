import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getHealth() {
    return {
      status: 'ok',
      service: 'vn-lms-service',
      timestamp: new Date().toISOString(),
    };
  }
}
