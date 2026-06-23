"use client";

import axios from "axios";
import Image from "next/image";
import type { ChangeEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "@/admin/hooks/hooks";
import {
  createProduct,
  getProducts,
} from "@/admin/services/products/productsService";
import type { ProductPayload } from "@/admin/services/products/productsService";
import { uploadAdminProductImages } from "@/admin/services/uploads/uploadsService";
import {
  createCurrencyOption,
  createProductCategoryOption,
  deleteCurrencyOption,
  deleteProductCategoryOption,
  getCurrencyOptions,
  getProductCategoryOptions,
  updateCurrencyOption,
  updateProductCategoryOption,
  type CurrencyOption,
  type ProductCategoryOption,
} from "@/admin/services/options/productOptionsService";
import { productFormSchema } from "@/admin/utils/validate";
import type { ProductFormValues } from "@/admin/utils/validate";

type Props = {
  onBack: () => void;
};

type CardProps = {
  title: string;
  children: ReactNode;
};

type FieldProps = {
  label: string;
  error?: string;
  children: ReactNode;
};

function uniqueValues(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function categoryLabel(category: ProductCategoryOption) {
  return category.path || category.pathSegments?.join(" > ") || category.name;
}

function normalizeCurrencyCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

function Card({ title, children }: CardProps) {
  return (
    <section className="dashboard-card p-5">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      {children}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

export default function AddProductPage({ onBack }: Props) {
  const dispatch = useAppDispatch();
  const [categories, setCategories] = useState<ProductCategoryOption[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [selectedCategorySlugs, setSelectedCategorySlugs] = useState<string[]>(
    [],
  );
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionError, setOptionError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryParentSlug, setCategoryParentSlug] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [categoryActionId, setCategoryActionId] = useState<string | null>(null);
  const [currencyCode, setCurrencyCode] = useState("");
  const [editingCurrencyCode, setEditingCurrencyCode] = useState<string | null>(
    null,
  );
  const [editingCurrencyValue, setEditingCurrencyValue] = useState("");
  const [currencyActionCode, setCurrencyActionCode] = useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema()),
    defaultValues: {
      title: "",
      amount: "",
      currency: "USD",
      categories: "",
      imageUrls: "",
      sourceUrl: "",
    },
  });

  const selectedCurrency =
    useWatch({ control, name: "currency" }) ?? "USD";

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) =>
        categoryLabel(a).localeCompare(categoryLabel(b)),
      ),
    [categories],
  );

  const sortedCurrencies = useMemo(
    () => [...currencies].sort((a, b) => a.code.localeCompare(b.code)),
    [currencies],
  );

  const categoriesBySlug = useMemo(
    () => new Map(categories.map((category) => [category.slug, category])),
    [categories],
  );

  const selectedCategoryOptions = useMemo(
    () =>
      selectedCategorySlugs
        .map((slug) => categoriesBySlug.get(slug))
        .filter((category): category is ProductCategoryOption =>
          Boolean(category),
        ),
    [categoriesBySlug, selectedCategorySlugs],
  );

  const activeImage = imageUrls[activeImageIndex] ?? imageUrls[0] ?? "";

  const loadOptions = useCallback(async () => {
    setOptionsLoading(true);
    setOptionError(null);

    try {
      const [categoryResult, currencyResult] = await Promise.all([
        getProductCategoryOptions(),
        getCurrencyOptions(),
      ]);
      const availableSlugs = new Set(
        categoryResult.categories.map((category) => category.slug),
      );

      setCategories(categoryResult.categories);
      setCurrencies(currencyResult.currencies);
      setSelectedCategorySlugs((current) =>
        current.filter((slug) => availableSlugs.has(slug)),
      );

      const currentCurrency = getValues("currency") || "USD";
      if (
        !currencyResult.currencies.some(
          (currency) => currency.code === currentCurrency,
        )
      ) {
        setValue("currency", "USD");
      }
    } catch (error) {
      setOptionError(getErrorMessage(error, "Could not load options."));
    } finally {
      setOptionsLoading(false);
    }
  }, [getValues, setValue]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOptions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadOptions]);

  function setProductImages(nextImages: string[]) {
    setImageUrls(nextImages);
    setValue("imageUrls", nextImages.join(", "), { shouldValidate: true });
    if (nextImages.length) clearErrors("imageUrls");
  }

  async function handleImageFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    setUploading(true);
    setUploadError(null);

    try {
      const result = await uploadAdminProductImages(files);
      const uploadedUrls = result.images.map((image) => image.url);
      const nextImages = uniqueValues([...imageUrls, ...uploadedUrls]);
      setProductImages(nextImages);
      setActiveImageIndex(imageUrls.length ? activeImageIndex : 0);
    } catch (error) {
      setUploadError(getErrorMessage(error, "Image upload failed."));
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    const nextImages = imageUrls.filter((imageUrl) => imageUrl !== url);
    setProductImages(nextImages);
    setActiveImageIndex((current) =>
      Math.min(current, Math.max(nextImages.length - 1, 0)),
    );
  }

  function toggleCategory(slug: string) {
    clearErrors("categories");
    setSelectedCategorySlugs((current) =>
      current.includes(slug)
        ? current.filter((categorySlug) => categorySlug !== slug)
        : uniqueValues([...current, slug]),
    );
  }

  function removeSelectedCategory(slug: string) {
    setSelectedCategorySlugs((current) =>
      current.filter((categorySlug) => categorySlug !== slug),
    );
  }

  async function handleCreateCategory() {
    const name = categoryName.trim();
    if (!name) {
      setOptionError("Category name is required.");
      return;
    }

    setOptionError(null);

    try {
      const result = await createProductCategoryOption({
        name,
        parentSlug: categoryParentSlug || null,
      });
      setCategoryName("");
      setCategoryParentSlug("");
      await loadOptions();
      setSelectedCategorySlugs((current) =>
        uniqueValues([...current, result.category.slug]),
      );
      clearErrors("categories");
    } catch (error) {
      setOptionError(getErrorMessage(error, "Could not create category."));
    }
  }

  function startEditCategory(category: ProductCategoryOption) {
    setEditingCategoryId(category._id);
    setEditingCategoryName(category.name);
  }

  async function handleUpdateCategory(category: ProductCategoryOption) {
    const name = editingCategoryName.trim();
    if (!name) {
      setOptionError("Category name is required.");
      return;
    }

    setCategoryActionId(category._id);
    setOptionError(null);

    try {
      await updateProductCategoryOption(category._id, { name });
      setEditingCategoryId(null);
      setEditingCategoryName("");
      await loadOptions();
    } catch (error) {
      setOptionError(getErrorMessage(error, "Could not update category."));
    } finally {
      setCategoryActionId(null);
    }
  }

  async function handleDeleteCategory(category: ProductCategoryOption) {
    const confirmed = window.confirm(
      `Delete category "${categoryLabel(category)}"?`,
    );
    if (!confirmed) return;

    setCategoryActionId(category._id);
    setOptionError(null);

    try {
      await deleteProductCategoryOption(category._id);
      removeSelectedCategory(category.slug);
      await loadOptions();
    } catch (error) {
      setOptionError(getErrorMessage(error, "Could not delete category."));
    } finally {
      setCategoryActionId(null);
    }
  }

  async function handleCreateCurrency() {
    const code = normalizeCurrencyCode(currencyCode);
    if (!code) {
      setOptionError("Currency code is required.");
      return;
    }

    setOptionError(null);

    try {
      const result = await createCurrencyOption({ code });
      setCurrencyCode("");
      await loadOptions();
      setValue("currency", result.currency.code, { shouldValidate: true });
    } catch (error) {
      setOptionError(getErrorMessage(error, "Could not create currency."));
    }
  }

  function startEditCurrency(currency: CurrencyOption) {
    setEditingCurrencyCode(currency.code);
    setEditingCurrencyValue(currency.code);
  }

  async function handleUpdateCurrency(code: string) {
    const nextCode = normalizeCurrencyCode(editingCurrencyValue);
    if (!nextCode) {
      setOptionError("Currency code is required.");
      return;
    }

    setCurrencyActionCode(code);
    setOptionError(null);

    try {
      const result = await updateCurrencyOption(code, { code: nextCode });
      setEditingCurrencyCode(null);
      setEditingCurrencyValue("");
      await loadOptions();
      if (selectedCurrency === code) {
        setValue("currency", result.currency.code, { shouldValidate: true });
      }
    } catch (error) {
      setOptionError(getErrorMessage(error, "Could not update currency."));
    } finally {
      setCurrencyActionCode(null);
    }
  }

  async function handleDeleteCurrency(code: string) {
    const confirmed = window.confirm(`Delete currency "${code}"?`);
    if (!confirmed) return;

    setCurrencyActionCode(code);
    setOptionError(null);

    try {
      await deleteCurrencyOption(code);
      if (selectedCurrency === code) {
        setValue("currency", "USD", { shouldValidate: true });
      }
      await loadOptions();
    } catch (error) {
      setOptionError(getErrorMessage(error, "Could not delete currency."));
    } finally {
      setCurrencyActionCode(null);
    }
  }

  async function onSubmit(data: ProductFormValues) {
    if (!selectedCategorySlugs.length) {
      setError("categories", {
        message: "Please select at least one category.",
      });
      return;
    }

    if (!imageUrls.length) {
      setError("imageUrls", {
        message: "Please upload at least one image.",
      });
      return;
    }

    if (uploading) {
      setError("imageUrls", {
        message: "Please wait for image uploads to finish.",
      });
      return;
    }

    const payload: ProductPayload = {
      title: data.title,
      price: {
        amount: Number(data.amount),
        currency: data.currency,
      },
      categorySlugs: selectedCategorySlugs,
      imageUrls,
    };

    try {
      await dispatch(createProduct(payload)).unwrap();
      await dispatch(getProducts({ limit: 1000 })).unwrap();
      onBack();
    } catch (error) {
      setError("root", {
        message:
          typeof error === "string"
            ? error
            : getErrorMessage(error, "Could not save product."),
      });
    }
  }

  return (
    <div className="animate-page-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
        >
          <ArrowLeft size={16} />
          Back to products
        </button>

        <button
          type="submit"
          form="admin-add-product-form"
          disabled={isSubmitting || uploading}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          Add Product
        </button>
      </div>

      <form
        id="admin-add-product-form"
        onSubmit={handleSubmit(onSubmit)}
<<<<<<< HEAD
        className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]"
      >
        <div className="space-y-6">
          <Card title="General Information">
            <Field label="Name Product" error={errors.title?.message}>
              <input
                {...register("title")}
                className="form-input bg-slate-50"
                placeholder="Arrival T-Shirt"
              />
            </Field>
          </Card>
=======
        className="dashboard-card w-full p-4 animate-card-in delay-150 sm:p-6"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Tên sản phẩm" error={errors.title?.message}>
            <input
              {...register("title")}
              className="form-input"
              placeholder="Arrival T-Shirt"
            />
          </Field>
>>>>>>> features/task-01

          <Card title="Pricing">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Base Pricing" error={errors.amount?.message}>
                <input
                  {...register("amount")}
                  className="form-input bg-slate-50"
                  inputMode="decimal"
                  placeholder="32"
                />
              </Field>

              <Field label="Currency" error={errors.currency?.message}>
                <select
                  {...register("currency")}
                  className="form-input bg-slate-50"
                  disabled={optionsLoading}
                >
                  {sortedCurrencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex gap-2">
                <input
                  value={currencyCode}
                  onChange={(event) =>
                    setCurrencyCode(normalizeCurrencyCode(event.target.value))
                  }
                  className="form-input h-10 flex-1 bg-slate-50"
                  placeholder="Create currency"
                />
                <button
                  type="button"
                  onClick={handleCreateCurrency}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-violet-600 px-3 text-sm font-semibold text-white hover:bg-violet-700"
                >
                  <Plus size={15} />
                  Add
                </button>
              </div>

              <div className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1">
                {sortedCurrencies.map((currency) => (
                  <div
                    key={currency.code}
                    className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2"
                  >
                    {editingCurrencyCode === currency.code ? (
                      <input
                        value={editingCurrencyValue}
                        onChange={(event) =>
                          setEditingCurrencyValue(
                            normalizeCurrencyCode(event.target.value),
                          )
                        }
                        className="form-input h-9 flex-1 bg-white"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setValue("currency", currency.code, {
                            shouldValidate: true,
                          })
                        }
                        className={`flex-1 text-left text-sm font-semibold ${
                          selectedCurrency === currency.code
                            ? "text-violet-700"
                            : "text-slate-700"
                        }`}
                      >
                        {currency.code}
                      </button>
                    )}

                    {editingCurrencyCode === currency.code ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateCurrency(currency.code)}
                          disabled={currencyActionCode === currency.code}
                          className="rounded-lg px-2 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCurrencyCode(null)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                          aria-label="Cancel currency edit"
                        >
                          <X size={15} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEditCurrency(currency)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-violet-700"
                          aria-label="Edit currency"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCurrency(currency.code)}
                          disabled={
                            currency.code === "USD" ||
                            currencyActionCode === currency.code
                          }
                          className="rounded-lg p-1.5 text-red-500 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Delete currency"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Upload Img">
            <div className="overflow-hidden rounded-2xl bg-slate-100">
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt="Product preview"
                  width={720}
                  height={720}
                  sizes="(max-width: 1280px) 100vw, 420px"
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center text-slate-400">
                  <ImagePlus size={54} strokeWidth={1.5} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {imageUrls.map((url, index) => (
                <div key={url} className="group relative">
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`aspect-square w-full overflow-hidden rounded-xl border bg-slate-50 ${
                      activeImageIndex === index
                        ? "border-violet-500"
                        : "border-slate-200"
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`Product thumbnail ${index + 1}`}
                      width={160}
                      height={160}
                      sizes="96px"
                      className="h-full w-full object-cover"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute -right-1 -top-1 rounded-full bg-white p-1 text-red-500 shadow-sm ring-1 ring-slate-200 opacity-0 transition group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}

              <label className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-violet-600 transition hover:bg-violet-50">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageFiles}
                  disabled={uploading}
                />
                {uploading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Plus size={20} />
                )}
              </label>
            </div>

            {errors.imageUrls?.message ? (
              <p className="text-xs text-red-500">{errors.imageUrls.message}</p>
            ) : null}
            {uploadError ? (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                {uploadError}
              </p>
            ) : null}
          </Card>

          <Card title="Category">
            <Field label="Product Category" error={errors.categories?.message}>
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="flex min-h-12 flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2">
                  {selectedCategoryOptions.length === 0 ? (
                    <span className="text-sm text-slate-400">
                      Select category
                    </span>
                  ) : (
                    selectedCategoryOptions.map((category) => (
                      <span
                        key={category.slug}
                        className="inline-flex items-center gap-1 rounded-lg bg-violet-100 px-2 py-1 text-sm font-semibold text-violet-700"
                      >
                        {categoryLabel(category)}
                        <button
                          type="button"
                          onClick={() => removeSelectedCategory(category.slug)}
                          className="rounded hover:bg-violet-200"
                          aria-label="Remove selected category"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div className="space-y-3 p-3">
                  <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_180px_auto]">
                    <input
                      value={categoryName}
                      onChange={(event) => setCategoryName(event.target.value)}
                      className="form-input bg-slate-50"
                      placeholder="Create category"
                    />
                    <select
                      value={categoryParentSlug}
                      onChange={(event) =>
                        setCategoryParentSlug(event.target.value)
                      }
                      className="form-input bg-slate-50"
                    >
                      <option value="">No parent</option>
                      {sortedCategories.map((category) => (
                        <option key={category.slug} value={category.slug}>
                          {categoryLabel(category)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3 text-sm font-semibold text-white hover:bg-violet-700"
                    >
                      <Plus size={15} />
                      Add
                    </button>
                  </div>

                  <p className="text-xs font-semibold text-slate-500">
                    Select an option or manage one
                  </p>

                  <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                    {optionsLoading ? (
                      <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-6 text-sm text-slate-500">
                        <Loader2 size={16} className="animate-spin" />
                        Loading categories
                      </div>
                    ) : (
                      sortedCategories.map((category) => {
                        const label = categoryLabel(category);
                        const isSelected = selectedCategorySlugs.includes(
                          category.slug,
                        );
                        const isEditing = editingCategoryId === category._id;
                        const isBusy = categoryActionId === category._id;

                        return (
                          <div
                            key={category._id}
                            className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                              isSelected ? "bg-violet-50" : "bg-slate-50"
                            }`}
                          >
                            {isEditing ? (
                              <input
                                value={editingCategoryName}
                                onChange={(event) =>
                                  setEditingCategoryName(event.target.value)
                                }
                                className="form-input h-9 flex-1 bg-white"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => toggleCategory(category.slug)}
                                className={`flex-1 text-left text-sm font-semibold ${
                                  isSelected
                                    ? "text-violet-700"
                                    : "text-slate-700"
                                }`}
                                style={{
                                  paddingLeft: Math.min(category.level, 4) * 10,
                                }}
                              >
                                {label}
                              </button>
                            )}

                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCategory(category)}
                                  disabled={isBusy}
                                  className="rounded-lg px-2 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCategoryId(null)}
                                  className="rounded-lg p-1.5 text-slate-500 hover:bg-white"
                                  aria-label="Cancel category edit"
                                >
                                  <X size={15} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEditCategory(category)}
                                  className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-violet-700"
                                  aria-label="Edit category"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(category)}
                                  disabled={isBusy}
                                  className="rounded-lg p-1.5 text-red-500 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                                  aria-label="Delete category"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </Field>
          </Card>
        </div>

        {(optionError || errors.root?.message) && (
          <div className="xl:col-span-2">
            {optionError ? (
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {optionError}
              </p>
            ) : null}
            {errors.root?.message ? (
              <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {errors.root.message}
              </p>
            ) : null}
          </div>
        )}
<<<<<<< HEAD
=======

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {isSubmitting ? "Đang lưu..." : "Thêm sản phẩm"}
          </button>
        </div>
>>>>>>> features/task-01
      </form>
    </div>
  );
}
