import { LazyImage } from "@/components/product/LazyImage";
import Link from "next/link";

const popularItems = [
  {
    title: "Gymshark x Bratz, June 8th",
    description: "For looking hot and lifting heavy.",
    href: "/products/women",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=85",
    alt: "Women training in bright activewear",
  },
  {
    title: "Ready For Lift(ing) Off",
    description: "These new rest day essentials make for perfect travel fits.",
    href: "/products/women",
    image:
      "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1200&q=85",
    alt: "Women wearing black and white gym basics",
  },
  {
    title: "Everyday Seamless Restock",
    description:
      "These are your soft, second-skin, seamless sets that keep you comfy and confident.",
    href: "/products/women",
    image:
      "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?auto=format&fit=crop&w=1200&q=85",
    alt: "Woman training outdoors in activewear",
  },
  {
    title: "Get 'Em In Pink",
    description: "The sets you love. Even more loveable in pink.",
    href: "/products/women",
    image:
      "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1200&q=85",
    alt: "Women stretching in a bright gym studio",
  },
];

export function HomePopularNow() {
  return (
    <section className="bg-store-paper px-4 pb-16 pt-0 text-store-ink-strong sm:px-8 lg:px-12">
      <div className="mb-8 flex flex-col items-start gap-6">
        <h2 className="text-2xl font-black uppercase leading-none tracking-normal sm:text-3xl">
          Popular Right Now
        </h2>
        <div className="flex items-center gap-3">
          <Link
            href="/products/women"
            className="inline-flex h-11 items-center justify-center rounded-full bg-store-ink-strong px-6 text-sm font-black uppercase text-store-paper transition-colors hover:bg-store-ink"
          >
            Women
          </Link>
          <Link
            href="/products/men"
            className="inline-flex h-11 items-center justify-center rounded-full bg-store-surface px-6 text-sm font-black uppercase text-store-ink-strong transition-colors hover:bg-store-border"
          >
            Men
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {popularItems.map((item) => (
          <article key={item.title} className="flex flex-col gap-4">
            <Link
              href={item.href}
              className="group relative block aspect-4/5 overflow-hidden bg-store-surface"
              aria-label={item.title}
            >
              <LazyImage
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </Link>
            <div className="flex flex-col gap-1">
              <Link
                href={item.href}
                className="text-base font-black uppercase leading-snug text-store-ink-strong hover:underline"
              >
                {item.title}
              </Link>
              <p className="text-sm leading-5 text-store-fg-muted">
                {item.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
