import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {
    const dbHost = this.configService.get<string>('database.host');
    const redisPort = this.configService.get<number>('redis.port');

    console.log(dbHost, redisPort);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
