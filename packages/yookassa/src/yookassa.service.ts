import { Injectable } from '@nestjs/common'
import { RefundService } from './modules/refund/refund.service'
import { InvoiceService } from './modules/invoice/invoice.service'
import { PaymentMethodService } from './modules/payment-method/payment-method.service'
import { PaymentService } from './modules/payment/payment.service'
import { ReceiptService } from './modules/receipt/receipt.service'
import { PayoutService } from './modules/payout/payout.service'
import { SbpBanksService } from './modules/sbp-banks/sbp-banks.service'
import { PersonalDataService } from './modules/personal-data/personal-data.service'
import { DealService } from './modules/deal/deal.service'
import { WebhookService } from './modules/webhook/webhook.service'
import { MeService } from './modules/me/me.service'

@Injectable()
export class YookassaService {
  public constructor(
    public payments: PaymentService,
    public paymentMethods: PaymentMethodService,
    public invoices: InvoiceService,
    public refunds: RefundService,
    public receipts: ReceiptService,
    public payouts: PayoutService,
    public sbpBanks: SbpBanksService,
    public personalData: PersonalDataService,
    public deals: DealService,
    public webhooks: WebhookService,
    public me: MeService
  ) {}
}
