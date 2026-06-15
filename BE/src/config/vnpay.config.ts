export const vnpayConfig = {
  tmnCode: process.env.VNPAY_TMN_CODE ?? "2QXUI4J4",
  hashSecret:
    process.env.VNPAY_HASH_SECRET ??
    "RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ",
  paymentUrl:
    process.env.VNPAY_URL ??
    "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  returnUrl:
    process.env.VNPAY_RETURN_URL ??
    `${process.env.API_ORIGIN ?? "http://localhost:3001"}/api/payments/vnpay/return`,
  ipnUrl:
    process.env.VNPAY_IPN_URL ??
    `${process.env.API_ORIGIN ?? "http://localhost:3001"}/api/payments/vnpay/ipn`,
  frontendOrigin:
    process.env.APP_ORIGIN ?? "http://localhost:3000",
  orderType: process.env.VNPAY_ORDER_TYPE ?? "other",
  locale: process.env.VNPAY_LOCALE ?? "vn",
  usdToVndRate: Number(process.env.VNPAY_USD_TO_VND_RATE ?? process.env.MOMO_USD_TO_VND_RATE ?? "25000"),
};

export function usdToVnd(amountUsd: number, rate = vnpayConfig.usdToVndRate): number {
  return Math.max(1, Math.round(amountUsd * rate));
}
