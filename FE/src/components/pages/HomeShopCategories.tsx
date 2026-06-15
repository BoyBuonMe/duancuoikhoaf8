import { LazyImage } from "@/components/product/LazyImage";
import Link from "next/link";

const shopCategories = [
  {
    title: "Shop Women",
    href: "/products/women",
    image:
      "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1200&q=85",
    alt: "Woman training in bright activewear",
  },
  {
    title: "Shop Men",
    href: "/products/men",
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=85",
    alt: "Man carrying kettlebells in a gym",
  },
  {
    title: "Shop Accessories",
    href: "/products/accessories",
    image:
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=85",
    alt: "Gym accessories arranged for training",
  },
];

export function HomeShopCategories() {
  return (
    <section className="bg-store-paper px-4 pb-16 pt-0 text-store-ink-strong sm:px-8 lg:px-12">
      <div className="grid grid-cols-1 gap-1 md:grid-cols-3">
        {shopCategories.map((category) => (
          <article key={category.title} className="flex flex-col gap-4">
            <Link
              href={category.href}
              className="group relative block aspect-[4/5] overflow-hidden bg-store-surface"
              aria-label={category.title}
            >
              <LazyImage
                src={category.image}
                alt={category.alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </Link>
            <Link
              href={category.href}
              className="text-base font-black uppercase leading-snug text-store-ink-strong hover:underline"
            >
              {category.title}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
