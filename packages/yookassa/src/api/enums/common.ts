export enum BankCardSourceEnum {
  MirPay = 'mir_pay',
  ApplePay = 'apple_pay',
  GooglePay = 'google_pay'
}

export enum BankCardTypeEnum {
  MasterCard = 'MasterCard',
  Visa = 'Visa',
  Mir = 'Mir',
  UnionPay = 'UnionPay',
  Jcb = 'JCB',
  AmericanExpress = 'AmericanExpress',
  DinersClub = 'DinersClub',
  DiscoverCard = 'DiscoverCard',
  InstaPayment = 'InstaPayment',
  InstaPaymentTM = 'InstaPaymentTM',
  Laser = 'Laser',
  Dankort = 'Dankort',
  Solo = 'Solo',
  Switch = 'Switch',
  Unknown = 'Unknown'
}

export enum CancellationDetailsPartyEnum {
  Merchant = 'merchant',
  YooMoney = 'yoo_money'
}

export enum CancellationDetailsReasonEnum {
  InvoiceCanceled = 'invoice_canceled',
  InvoiceExpired = 'invoice_expired',
  GeneralDecline = 'general_decline',
  PaymentCanceled = 'payment_canceled',
  PaymentExpiredOnCapture = 'payment_expired_on_capture'
}

export enum CreateReceiptTypeEnum {
  Payment = 'payment',
  Refund = 'refund'
}

export enum DealFeeMomentEnum {
  PaymentSucceeded = 'payment_succeeded',
  DealClosed = 'deal_closed'
}

export enum DealStatusEnum {
  Opened = 'opened',
  Closed = 'closed'
}

export enum FiscalizationProviderEnum {
  Avanpost = 'avanpost',
  YooReceipt = 'yoo_receipt',
  AQsi = 'a_qsi',
  Atol = 'atol',
  BusinessRu = 'business_ru',
  DigitalKassa = 'digital_kassa',
  Evotor = 'evotor',
  FirstOfd = 'first_ofd',
  KitInvest = 'kit_invest',
  Komtet = 'komtet',
  LifePay = 'life_pay',
  Mertrade = 'mertrade',
  ModulKassa = 'modul_kassa',
  Rocket = 'rocket',
  ShtrihM = 'shtrih_m'
}

export enum LocaleEnum {
  RuRu = 'ru_RU',
  EnUs = 'en_US'
}

export enum MeStatusEnum {
  Enabled = 'enabled',
  Disabled = 'disabled'
}

export enum PaymentDetailsStatusEnum {
  WaitingForCapture = 'waiting_for_capture',
  Succeeded = 'succeeded',
  Canceled = 'canceled'
}

export enum PaymentMethodStatusEnum {
  Pending = 'pending',
  Active = 'active',
  Inactive = 'inactive'
}

export enum BasicStatusEnum {
  Pending = 'pending',
  Succeeded = 'succeeded',
  Canceled = 'canceled'
}

export enum PaymentStatusEnum {
  Pending = 'pending',
  WaitingForCapture = 'waiting_for_capture',
  Succeeded = 'succeeded',
  Canceled = 'canceled'
}

export enum PayoutMethodEnum {
  BankCard = 'bank_card',
  YooMoney = 'yoo_money',
  Sbp = 'sbp'
}

export enum PersonalDataStatusEnum {
  WaitingForOperation = 'waiting_for_operation',
  Active = 'active',
  Canceled = 'canceled'
}

export enum PersonalDataTypeEnum {
  SbpPayoutRecipient = 'sbp_payout_recipient',
  PayoutStatementRecipient = 'payout_statement_recipient'
}

export enum VatRateEnum {
  Value5 = '5',
  Value7 = '7',
  Value10 = '10',
  Value20 = '20',
  Value22 = '22'
}

/**
 * Типы событий, о которых YooKassa отправляет уведомления.
 */
export enum NotificationEventEnum {
  /**
   * Платеж ожидает подтверждения.
   */
  PAYMENT_WAITING_FOR_CAPTURE = 'payment.waiting_for_capture',

  /**
   * Платеж успешно завершен.
   */
  PAYMENT_SUCCEEDED = 'payment.succeeded',

  /**
   * Платеж отменен.
   */
  PAYMENT_CANCELED = 'payment.canceled',

  /**
   * Возврат успешно завершен.
   */
  REFUND_SUCCEEDED = 'refund.succeeded'
}

/**
 * Тип уведомления.
 */
export enum NotificationTypeEnum {
  /**
   * Уведомление о событии.
   */
  NOTIFICATION = 'notification'
}
