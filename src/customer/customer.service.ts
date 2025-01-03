import { Inject } from '@nestjs/common';
import { MERCHANT } from '@common/constant';
import { CreateCustomerDto, GetCustomerDto } from './customer.dto';
import { CustomerTierService } from '../customer_tier/customer_tier.service';
import { getServiceToken } from '@common/utils/misc';
import { MerchantServiceMethods } from '@common/dto/merchant.dto';
import AppService from '@common/decorator/app_service.decorator';
import { AUserService } from '@shared/user/user.service';
import AppRedisService from '@common/core/app_redis/app_redis.service';
import Customer from './customer.schema';
import AppBrokerService from '@common/core/app_broker/app_broker.service';
import { EUser } from '@common/utils/enum';
import AddressService from '@shared/address/address.service';
import RequestContextService from '@common/core/request_context/request_context_service';
import CategoryService from '@shared/category/category.service';

@AppService()
export default class CustomerService extends AUserService<Customer> {
   constructor(
      protected readonly db: AppRedisService,
      protected readonly appBroker: AppBrokerService,
      protected readonly categoryService: CategoryService,
      protected readonly addressService: AddressService,
      @Inject(getServiceToken(MERCHANT)) protected readonly merchantService: MerchantServiceMethods,
      private readonly tierService: CustomerTierService,
   ) {
      super();
   }

   async createUser({ addressId, ...dto }: CreateCustomerDto) {
      const context = await this.moduleRef.resolve(RequestContextService);
      const repository = await this.getRepository();
      const { data: tier } = await this.tierService.getTier({ isBaseTier: true });
      const { data: address } = addressId
         ? await this.addressService.findById({ id: addressId })
         : undefined;
      return await repository.create({
         ...dto,
         address,
         tier,
         merchant: context.get('merchant').merchant,
         type: EUser.Customer,
      });
   }

   //NOTE: This will prioritized auth user(if it customer). If need customer with id, use findById
   async getCustomer({
      id,
   }: GetCustomerDto): Promise<{ data: Customer | undefined; message: string | undefined }> {
      const context = await this.moduleRef.resolve(RequestContextService);
      const repository = await this.getRepository();
      const authUser = context.get('user');
      const isCustomerLoggedIn = authUser.type === EUser.Customer;
      if (!isCustomerLoggedIn && !id) return { data: undefined, message: 'Customer not logged in' };
      const { data: user } = await repository.findOne({
         id: isCustomerLoggedIn ? authUser.id : id,
      });
      return { data: user, message: undefined };
   }

   // async addCustomerAllowance({ request_context, customerId, allowanceId }: AddCustomerAllowanceDto) {
   //    const { data: customer } = await this.repository.findOne({
   //       id: customerId,
   //       errorOnNotFound: true,
   //       options: { lean: false },
   //    });
   //    const updateCredit = (exp: string | Date, ext: boolean, amount: number, point?: boolean) => {
   //       if (exp) {
   //          if (ext || !request_context.get('merchantConfig')[`extCus${point ? 'Point' : 'Cash'}`])
   //             customer.timedPoint[new Date(exp).getTime()] = amount;
   //          else {
   //             const extCredit = `extensible${point ? 'Point' : 'Cash'}`;
   //             const hTime =
   //                customer[extCredit] && $dayjs(customer[extCredit].expireAt).isAfter($dayjs(exp))
   //                   ? customer[extCredit].expireAt
   //                   : exp;
   //             customer.extensibleCash = {
   //                expireAt: new Date(hTime).toISOString(),
   //                amount: (customer[extCredit]?.amount ?? 0) + amount,
   //             };
   //          }
   //       } else customer[point ? 'point' : 'cash'] += amount;
   //    };
   //
   //    const allowance = await this.allowanceService.monitorExpire({ id: allowanceId }, true);
   //    if (
   //       [EMerchantAllowanceBenefit.Point, EMerchantAllowanceBenefit.Cash].includes(
   //          allowance.benefit.type,
   //       )
   //    )
   //       updateCredit(
   //          allowance.expireAt,
   //          allowance.benefit.bypassExtendability,
   //          allowance.benefit.amount,
   //          allowance.benefit.type === EMerchantAllowanceBenefit.Point,
   //       );
   //    else customer.allowances.push(allowance);
   //    return { data: await customer.save({ session: request_context.get('session') }) };
   // }
}
