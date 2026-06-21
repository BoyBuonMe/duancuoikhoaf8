import type { NextFunction, Request, Response } from "express";
import { httpError } from "@/utils/http-error";
import * as adminService from "@/models/admin/admin.service";
import type {
  AdminCreateProductBody,
  AdminCreateVariantBody,
  AdminCreateVoucherBody,
  AdminListOrdersQuery,
  AdminListProductsQuery,
  AdminListUsersQuery,
  AdminListVouchersQuery,
  AdminOrderCodeParams,
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
      req.user?.id,
      req.user?.role,
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
    await adminService.deleteProduct(id, req.user?.id, req.user?.role);
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
      req.user?.id,
      req.user?.role,
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
    await adminService.deleteVoucher(id, req.user?.id, req.user?.role);
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
