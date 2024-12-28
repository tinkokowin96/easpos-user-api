import { Module } from '@nestjs/common';
import { UserAppModule } from './user_app/user_app.module';
import { PartnerModule } from './partner/partner.module';
import { CustomerTierModule } from './customer_tier/customer_tier.module';
import CoreModule from '@common/core/module/core.module';
import CoreHttpModule from '@common/core/module/core_http.module';
import CustomerModule from './customer/customer.module';

@Module({
   imports: [
      CoreModule,
      CoreHttpModule,
      UserAppModule,
      CustomerTierModule,
      CustomerModule,
      PartnerModule,
   ],
   controllers: [],
})
export class AppModule {}
