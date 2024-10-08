import { Module } from '@nestjs/common';
import { UserAppController } from './user_app.controller';
import { UserAppService } from './user_app.service';
import { getGrpcClient } from '@common/utils/misc';
import { MERCHANT } from '@common/constant';
import { ClientsModule } from '@nestjs/microservices';

const [clients, providers] = getGrpcClient([MERCHANT]);

@Module({
   imports: [ClientsModule.register(clients)],
   controllers: [UserAppController],
   providers: [UserAppService, ...providers],
})
export class UserAppModule {}
