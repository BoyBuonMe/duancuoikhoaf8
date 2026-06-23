import type { NextFunction, Request, Response } from "express";
import { httpError } from "@/utils/http-error";
import * as adminService from "@/models/admin/admin.service";
import { uploadAdminImages } from "@/models/admin/admin.upload";
import type {
  AdminCreateCategoryOptionBody,
  AdminCreateCurrencyOptionBody,
  AdminCreateProductBody,
  AdminCreateVariantBody,
  AdminCreateVoucherBody,
  AdminCurrencyCodeParams,
  AdminListOrdersQuery,
  AdminListProductsQuery,
  AdminListUsersQuery,
  AdminListVouchersQuery,
  AdminOrderCodeParams,
  AdminUpdateCategoryOptionBody,
  AdminUpdateCurrencyOptionBody,
  AdminUpdateOrderStatusBody,
  AdminUpdateProductBody,
  AdminUpdateUserBody,
  AdminUpdateVariantBody,
  AdminUpdateVoucherBody,
} from "@/models/admin/admin.validation";

function validatedQuery<TQuery>(req: Request) {
  return req.query as unknown as TQuery;
}

function validatedBody<TBody>(req: Request) {
  return req.body as TBody;
}

function requestId(req: Request) {
  const id = req.params.id;
  if (typeof id !== "string") {
    throw httpError("Invalid id", 400);
  }
  return id;
}

export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await adminService.listUsers(
      validatedQuery<AdminListUsersQuery>(req),
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function getUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requestId(req);
    const user = await adminService.getUser(id);
    res.json({ user });
  } catch (e) {
    next(e);
  }
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requestId(req);
    const user = await adminService.updateUser(
      id,
      validatedBody<AdminUpdateUserBody>(req),
      req.user?.id,
      req.user?.role,
    );
    res.json({ user });
  } catch (e) {
    next(e);
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requestId(req);
    await adminService.deleteUser(id, req.user?.id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

export async function listProductCategoryOptions(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await adminService.listProductCategoryOptions();
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function createProductCategoryOption(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const category = await adminService.createProductCategoryOption(
      validatedBody<AdminCreateCategoryOptionBody>(req),
    );
    res.status(201).json({ category });
  } catch (e) {
    next(e);
  }
}

export async function updateProductCategoryOption(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requestId(req);
    const category = await adminService.updateProductCategoryOption(
      id,
      validatedBody<AdminUpdateCategoryOptionBody>(req),
    );
    res.json({ category });
  } catch (e) {
    next(e);
  }
}

export async function deleteProductCategoryOption(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requestId(req);
    await adminService.deleteProductCategoryOption(id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

export async function listCurrencyOptions(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await adminService.listCurrencyOptions();
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function createCurrencyOption(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const currency = await adminService.createCurrencyOption(
      validatedBody<AdminCreateCurrencyOptionBody>(req),
    );
    res.status(201).json({ currency });
  } catch (e) {
    next(e);
  }
}

export async function updateCurrencyOption(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { code } = req.params as unknown as AdminCurrencyCodeParams;
    const currency = await adminService.updateCurrencyOption(
      code,
      validatedBody<AdminUpdateCurrencyOptionBody>(req),
    );
    res.json({ currency });
  } catch (e) {
    next(e);
  }
}

export async function deleteCurrencyOption(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { code } = req.params as unknown as AdminCurrencyCodeParams;
    await adminService.deleteCurrencyOption(code);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

export async function uploadImages(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    const images = await uploadAdminImages(files);
    res.status(201).json({ images });
  } catch (e) {
    next(e);
  }
}

export async function listProducts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await adminService.listProducts(
      validatedQuery<AdminListProductsQuery>(req),
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function getProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requestId(req);
    const product = await adminService.getProduct(id);
    res.json({ product });
  } catch (e) {
    next(e);
  }
}

export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const product = await adminService.createProduct(
      validatedBody<AdminCreateProductBody>(req),
    );
    res.status(201).json({ product });
  } catch (e) {
    next(e);
  }
}

export async function updateProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requestId(req);
    const product = await adminService.updateProduct(
      id,
      validatedBody<AdminUpdateProductBody>(req),
    );
    res.json({ product });
  } catch (e) {
    next(e);
  }
}

export async function deleteProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requestId(req);
    await adminService.deleteProduct(id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

export async function createProductVariant(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requestId(req);
    const variant = await adminService.createProductVariant(
      id,
      validatedBody<AdminCreateVariantBody>(req),
    );
    res.status(201).json({ variant });
  } catch (e) {
    next(e);
  }
}

export async function updateProductVariant(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requestId(req);
    const variant = await adminService.updateProductVariant(
      id,
      validatedBody<AdminUpdateVariantBody>(req),
    );
    res.json({ variant });
  } catch (e) {
    next(e);
  }
}

export async function deleteProductVariant(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requestId(req);
    await adminService.deleteProductVariant(id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

export async function listVouchers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await adminService.listVouchers(
      validatedQuery<AdminListVouchersQuery>(req),
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function getVoucher(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requestId(req);
    const voucher = await adminService.getVoucher(id);
    res.json({ voucher });
  } catch (e) {
    next(e);
  }
}

export async function createVoucher(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const voucher = await adminService.createVoucher(
      validatedBody<AdminCreateVoucherBody>(req),
    );
    res.status(201).json({ voucher });
  } catch (e) {
    next(e);
  }
}

export async function updateVoucher(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requestId(req);
    const voucher = await adminService.updateVoucher(
      id,
      validatedBody<AdminUpdateVoucherBody>(req),
    );
    res.json({ voucher });
  } catch (e) {
    next(e);
  }
}

export async function deleteVoucher(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requestId(req);
    await adminService.deleteVoucher(id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

export async function listOrders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await adminService.listOrders(
      validatedQuery<AdminListOrdersQuery>(req),
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function getOrder(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { orderCode } = req.params as unknown as AdminOrderCodeParams;
    const order = await adminService.getOrder(orderCode);
    res.json({ order });
  } catch (e) {
    next(e);
  }
}

export async function updateOrderStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { orderCode } = req.params as unknown as AdminOrderCodeParams;
    const order = await adminService.updateOrderStatus(
      orderCode,
      validatedBody<AdminUpdateOrderStatusBody>(req),
    );
    res.json({ order });
  } catch (e) {
    next(e);
  }
}
