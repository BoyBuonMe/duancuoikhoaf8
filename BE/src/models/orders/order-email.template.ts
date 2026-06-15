export interface OrderEmailItem {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image?: string;
  size?: string;
}

export interface GenerateOrderEmailParams {
  customerName: string;
  customerTell: string;
  orderCode: string;
  orderDate: string;
  items: OrderEmailItem[];
  shippingAddress: string;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  voucherDiscount: number;
  promoDiscount: number;
  total: number;
  storeName: string;
  supportEmail: string;
  hotline: string;
  logoUrl?: string;
  storeUrl?: string;
  /** Raw payment method key, e.g. vnpay, momo, cod */
  paymentMethodKey?: string;
}

function isOnlinePrepaidPayment(method?: string): boolean {
  return method === "vnpay" || method === "momo";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function renderLogo(params: GenerateOrderEmailParams): string {
  const storeName = escapeHtml(params.storeName);
  const storeUrl = escapeHtml(params.storeUrl ?? "#");

  if (params.logoUrl?.trim()) {
    return `
      <a href="${storeUrl}" style="text-decoration:none;display:inline-block;">
        <img
          src="${escapeHtml(params.logoUrl.trim())}"
          alt="${storeName}"
          width="160"
          style="display:block;max-width:160px;height:auto;border:0;"
        />
      </a>
    `;
  }

  return `
    <a
      href="${storeUrl}"
      style="text-decoration:none;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:900;letter-spacing:0.18em;"
    >
      ${storeName.toUpperCase()}
    </a>
  `;
}

function renderProductRows(items: OrderEmailItem[]): string {
  return items
    .map((item, index) => {
      const name = escapeHtml(item.name);
      const sizeLabel = item.size?.trim()
        ? `<br /><span style="color:#71717a;font-size:12px;">Size: ${escapeHtml(item.size.trim())}</span>`
        : "";
      const thumb = item.image?.trim()
        ? `<img src="${escapeHtml(item.image.trim())}" alt="${name}" width="72" height="72" style="display:block;width:72px;height:72px;object-fit:cover;border-radius:8px;border:0;" />`
        : `<div style="width:72px;height:72px;border-radius:8px;background:#f4f4f5;"></div>`;

      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #ececec;vertical-align:top;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="84" style="vertical-align:top;padding-right:12px;">
                  ${thumb}
                </td>
                <td style="vertical-align:top;font-family:Arial,Helvetica,sans-serif;">
                  <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#18181b;line-height:1.4;">
                    ${index + 1}. ${name}
                    ${sizeLabel}
                  </p>
                  <p style="margin:0 0 4px;font-size:13px;color:#52525b;">Số lượng: ${item.quantity}</p>
                  <p style="margin:0 0 4px;font-size:13px;color:#52525b;">Đơn giá: ${formatUsd(item.unitPrice)}</p>
                  <p style="margin:0;font-size:13px;color:#18181b;font-weight:700;">Thành tiền: ${formatUsd(item.lineTotal)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderDiscountRows(
  voucherDiscount: number,
  promoDiscount: number,
): string {
  const rows: string[] = [];
  if (voucherDiscount > 0) {
    rows.push(`
      <tr>
        <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#52525b;">Giảm giá voucher</td>
        <td align="right" style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#16a34a;font-weight:600;">-${formatUsd(voucherDiscount)}</td>
      </tr>
    `);
  }
  if (promoDiscount > 0) {
    rows.push(`
      <tr>
        <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#52525b;">Giảm giá mã khuyến mãi</td>
        <td align="right" style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#16a34a;font-weight:600;">-${formatUsd(promoDiscount)}</td>
      </tr>
    `);
  }
  return rows.join("");
}

function renderPaidAndDueRows(params: GenerateOrderEmailParams): string {
  const isPrepaid = isOnlinePrepaidPayment(params.paymentMethodKey);
  const paidRow = isPrepaid
    ? `
      <tr>
        <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#16a34a;font-weight:600;">Đã thanh toán</td>
        <td align="right" style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#16a34a;font-weight:600;">${formatUsd(params.total)}</td>
      </tr>
    `
    : "";

  const amountDue = isPrepaid ? 0 : params.total;

  return `
    ${paidRow}
    <tr>
      <td colspan="2" style="padding-top:12px;border-top:1px solid #ececec;"></td>
    </tr>
    <tr>
      <td style="padding-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:800;color:#18181b;">Tổng thanh toán</td>
      <td align="right" style="padding-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:800;color:#18181b;">${formatUsd(amountDue)}</td>
    </tr>
  `;
}

/** Rich HTML template for order confirmation emails. */
export function generateOrderEmail(params: GenerateOrderEmailParams): string {
  const customerName = escapeHtml(params.customerName);
  const customerTell = escapeHtml(params.customerTell);
  const orderCode = escapeHtml(params.orderCode);
  const orderDate = escapeHtml(params.orderDate);
  const shippingAddress = escapeHtml(params.shippingAddress);
  const paymentMethod = escapeHtml(params.paymentMethod);
  const storeName = escapeHtml(params.storeName);
  const supportEmail = escapeHtml(params.supportEmail);
  const hotline = escapeHtml(params.hotline);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Xác nhận đơn hàng ${orderCode}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f4f5;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#18181b;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
              ${renderLogo(params)}
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="background:#ffffff;padding:32px 32px 8px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;">
                    <span style="display:inline-block;background:#ecfdf5;color:#047857;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:8px 12px;border-radius:999px;">
                      Đặt hàng thành công
                    </span>
                    <h1 style="margin:16px 0 8px;font-size:24px;line-height:1.3;color:#18181b;font-weight:800;">
                      Xác nhận đơn hàng ${orderCode}
                    </h1>
                    <p style="margin:0;font-size:15px;line-height:1.6;color:#52525b;">
                      Xin chào <strong style="color:#18181b;">${customerName}</strong>,
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="background:#ffffff;padding:8px 32px 24px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#52525b;">
                Cảm ơn bạn đã mua sắm tại <strong style="color:#18181b;">${storeName}</strong>.
              </p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#52525b;">
                Đơn hàng của bạn đã được đặt thành công và đang được xử lý.
              </p>
            </td>
          </tr>

          <!-- Order info -->
          <tr>
            <td style="background:#ffffff;padding:0 32px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#fafafa;border:1px solid #ececec;border-radius:12px;">
                <tr>
                  <td style="padding:20px;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#71717a;">
                      Thông tin đơn hàng
                    </p>
                    <p style="margin:0 0 6px;font-size:14px;color:#18181b;"><strong>Mã đơn hàng:</strong> ${orderCode}</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#18181b;"><strong>Ngày đặt:</strong> ${orderDate}</p>
                    <p style="margin:0;font-size:14px;color:#18181b;"><strong>Trạng thái:</strong> Đang xử lý</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Products -->
          <tr>
            <td style="background:#ffffff;padding:0 32px 8px;">
              <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#71717a;">
                Sản phẩm
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                ${renderProductRows(params.items)}
              </table>
            </td>
          </tr>

          <!-- Shipping -->
          <tr>
            <td style="background:#ffffff;padding:16px 32px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#fafafa;border:1px solid #ececec;border-radius:12px;">
                <tr>
                  <td style="padding:20px;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#71717a;">
                      Thông tin giao hàng
                    </p>
                    <p style="margin:0 0 6px;font-size:14px;color:#18181b;"><strong>Người nhận:</strong> ${customerName}</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#18181b;"><strong>Số điện thoại:</strong> ${customerTell}</p>
                    <p style="margin:0;font-size:14px;color:#18181b;"><strong>Địa chỉ:</strong> ${shippingAddress}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment -->
          <tr>
            <td style="background:#ffffff;padding:0 32px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #ececec;border-radius:12px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#71717a;">
                      Thanh toán
                    </p>
                    <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#18181b;">
                      <strong>Phương thức:</strong> ${paymentMethod}
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#52525b;">Tạm tính</td>
                        <td align="right" style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#18181b;">${formatUsd(params.subtotal)}</td>
                      </tr>
                      ${renderDiscountRows(params.voucherDiscount, params.promoDiscount)}
                      <tr>
                        <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#52525b;">Phí vận chuyển</td>
                        <td align="right" style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#18181b;">${formatUsd(params.shippingFee)}</td>
                      </tr>
                      ${renderPaidAndDueRows(params)}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Notice -->
          <tr>
            <td style="background:#ffffff;padding:0 32px 28px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0;font-size:14px;line-height:1.6;color:#52525b;">
                Chúng tôi sẽ thông báo cho bạn khi đơn hàng được giao cho đơn vị vận chuyển.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#18181b;border-radius:0 0 16px 16px;padding:24px 32px;font-family:Arial,Helvetica,sans-serif;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#d4d4d8;">
                Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ:
              </p>
              <p style="margin:0 0 4px;font-size:13px;line-height:1.6;color:#ffffff;">
                Email: <a href="mailto:${supportEmail}" style="color:#ffffff;text-decoration:underline;">${supportEmail}</a>
              </p>
              <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#ffffff;">
                Hotline: ${hotline}
              </p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:#a1a1aa;">
                Trân trọng,<br />
                <strong style="color:#ffffff;">${storeName}</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
