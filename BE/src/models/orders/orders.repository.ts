import Order from "@/models/orders/Order.model";

export async function findOrdersByEmail(email: string) {
  return Order.find({ userEmail: email }).sort({ createdAt: -1 }).lean();
}

export async function findOrderByCodeForEmail(
  orderCode: string,
  email: string,
) {
  return Order.findOne({
    orderCode: orderCode.toUpperCase(),
    userEmail: email,
  }).lean();
}

export async function createOrder(data: Record<string, unknown>) {
  return Order.create(data);
}

export async function findOrderByCode(orderCode: string) {
  return Order.findOne({ orderCode: orderCode.toUpperCase() }).lean();
}

export async function findOrderByMomoOrderId(momoOrderId: string) {
  return Order.findOne({ momoOrderId: momoOrderId.toUpperCase() }).lean();
}

export async function findOrderByVnpTxnRef(vnpTxnRef: string) {
  return Order.findOne({ vnpTxnRef: vnpTxnRef.toUpperCase() }).lean();
}

export async function updateOrderPayment(
  orderCode: string,
  update: { isPay: boolean; status: string },
) {
  return Order.findOneAndUpdate(
    { orderCode: orderCode.toUpperCase() },
    { $set: update },
    { new: true },
  ).lean();
}

export async function setOrderMomoOrderId(
  orderCode: string,
  momoOrderId: string,
) {
  return Order.findOneAndUpdate(
    { orderCode: orderCode.toUpperCase() },
    { $set: { momoOrderId } },
    { new: true },
  ).lean();
}
