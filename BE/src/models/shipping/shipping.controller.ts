import type { NextFunction, Request, Response } from "express";
import * as shippingService from "@/models/shipping/shipping.service";
import type { ShippingQuoteBody } from "@/models/shipping/shipping.validation";

export async function getShippingQuote(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body as ShippingQuoteBody;
    const baseInput = {
      country: body.country,
      provinceCode: body.provinceCode,
      provinceName: body.provinceName,
      wardName: body.wardName,
      streetAddress: body.streetAddress,
    };

    if (!body.deliveryMethod) {
      const options = await shippingService.quoteAllShippingOptions(baseInput);
      res.json({ options });
      return;
    }

    const quote = await shippingService.quoteShipping({
      ...baseInput,
      deliveryMethod: body.deliveryMethod,
    });
    res.json({ quote });
  } catch (e) {
    next(e);
  }
}
