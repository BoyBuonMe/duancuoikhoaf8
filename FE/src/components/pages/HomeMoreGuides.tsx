import { LazyImage } from "@/components/product/LazyImage";
import Link from "next/link";

const guideItems = [
  {
    title: "Leggings Guide",
    description:
      "Stop looking; start finding the leggings you've been looking for. However you train, whatever your look, we've got a match.",
    href: "/products/women",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=85",
    alt: "Woman wearing black activewear leggings",
  },
  {
    title: "Sports Bra Guide",
    description:
      "Find the one with high, medium and light-support sports bras more trustworthy and reliable than your ex.",
    href: "/products/women",
    image:
      "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1200&q=85",
    alt: "Woman wearing a bright sports bra",
  },
  {
    title: "Men's Shorts Guide",
    description:
      "Everything you need to know about the best gym shorts in the game, from repping, to running, to rest day.",
    href: "/products/men",
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=85",
    alt: "Man wearing gym shorts",
  },
  {
    title: "The Gymshark Running Hub",
    description: "For every runner, every route, and every reason you lace up.",
    href: "/products",
    image:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=85",
    alt: "Runners stretching on a city street",
  },
];

const categoryColumns = [
  {
    title: "Women's Leggings",
    links: [
      "Gym Leggings",
      "Leggings With Pockets",
      "High Waisted Leggings",
      "Scrunch Bum Leggings",
      "Black Leggings",
      "Flare Leggings",
      "Seamless Leggings",
    ],
  },
  {
    title: "Women's Gymwear",
    links: [
      "Women's Gym Wear",
      "Womens Gym Shorts",
      "Running Shorts",
      "Sports Bras",
      "High Impact Sports Bras",
      "Black Sports Bras",
      "Matching Sets",
      "Loungewear",
    ],
  },
  {
    title: "Men's Gymwear",
    links: [
      "Men's Gymwear",
      "Mens Gym Shorts",
      "Shorts with Pockets",
      "Men's Running Shorts",
      "Gym Shirts",
      "Sleeveless T-Shirts",
      "Gym Stringers",
      "Men's Baselayers",
    ],
  },
  {
    title: "Accessories",
    links: [
      "Women's Underwear",
      "Men's Underwear",
      "Workout Bags",
      "Duffel Bags",
      "Gym Socks",
      "Crew Socks",
      "Caps",
      "Beanies",
    ],
  },
];

const inlineLinkClass =
  "font-black text-store-ink-strong transition-colors hover:underline";

export function HomeMoreGuides() {
  return (
    <section className="bg-store-paper px-4 pb-16 pt-0 text-store-ink-strong sm:px-8 lg:px-12">
      <div className="mb-8 flex flex-col items-start gap-6">
        <h2 className="text-2xl font-black uppercase leading-none tracking-normal sm:text-3xl">
          Wait There&apos;s More...
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center rounded-full bg-store-ink-strong px-5 text-sm font-black uppercase text-store-paper transition-colors hover:bg-store-ink"
          >
            Guides
          </Link>
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center rounded-full bg-store-surface px-5 text-sm font-black uppercase text-store-ink-strong transition-colors hover:bg-store-border"
          >
            Trending
          </Link>
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center rounded-full bg-store-surface px-5 text-sm font-black uppercase text-store-ink-strong transition-colors hover:bg-store-border"
          >
            Training
          </Link>
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center rounded-full bg-store-surface px-5 text-sm font-black uppercase text-store-ink-strong transition-colors hover:bg-store-border"
          >
            Apps
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {guideItems.map((item) => (
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

      <div className="mt-20 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {categoryColumns.map((column) => (
          <div key={column.title} className="flex flex-col gap-5">
            <h3 className="text-lg font-black uppercase leading-none tracking-normal sm:text-xl">
              {column.title}
            </h3>
            <div className="flex flex-col gap-3">
              {column.links.map((link) => (
                <Link
                  key={link}
                  href="/products"
                  className="text-sm font-medium leading-5 text-store-ink-strong hover:underline"
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24 border-t border-store-border pt-14">
        <div className="max-w-none space-y-7 text-base leading-7 text-store-ink-strong">
          <div className="space-y-5">
            <h2 className="text-3xl font-black uppercase leading-tight tracking-normal sm:text-4xl">
              Workout Clothes &amp; Gym Clothes
            </h2>
            <p>
              Workout Clothes designed to help you become your personal best.
              Because when it comes to performing at your max, there should be
              no obstacles - least of all your workout clothes.
            </p>
            <p>
              Functional and comfortable, we create workout clothing you&apos;ll
              sweat in. Since 2012, we&apos;ve designed and created the workout
              clothes we want to wear, because training and its people are what
              we know best.
            </p>
          </div>

          <div className="space-y-5">
            <h3 className="text-2xl font-black uppercase leading-tight tracking-normal sm:text-3xl">
              Gym Clothes Built In The Weight Room
            </h3>
            <p>
              Our legacy was built in the weight room. Gymshark was founded with
              a love for training and that passion continues into all our gym
              clothes today. You&apos;ll find the latest innovation in gym
              clothing and accessories to help you perform at your best and
              recover in style.
            </p>
            <p>
              Our{" "}
              <Link href="/products/men" className={inlineLinkClass}>
                Men&apos;s Workout Clothes
              </Link>{" "}
              feature sweat wicking{" "}
              <Link href="/products/men" className={inlineLinkClass}>
                workout shirts
              </Link>{" "}
              and{" "}
              <Link href="/products/men" className={inlineLinkClass}>
                tank tops
              </Link>
              ,{" "}
              <Link href="/products/men" className={inlineLinkClass}>
                gym shorts
              </Link>
              ,{" "}
              <Link href="/products/men" className={inlineLinkClass}>
                sweatpants
              </Link>{" "}
              and more. Whilst our{" "}
              <Link href="/products/women" className={inlineLinkClass}>
                Women&apos;s Workout Clothes
              </Link>{" "}
              are designed for a range of movements and feature sophisticated
              seamless technology, clever contouring and durable, quick-dry sweat
              wicking fabrics on{" "}
              <Link href="/products/women" className={inlineLinkClass}>
                leggings
              </Link>
              ,{" "}
              <Link href="/products/women" className={inlineLinkClass}>
                sports bras
              </Link>{" "}
              and more.
            </p>
            <p>
              An obsession with lifting is what started this brand, and we
              haven&apos;t forgotten our roots. Our{" "}
              <Link href="/products/women" className={inlineLinkClass}>
                Women&apos;s
              </Link>{" "}
              and{" "}
              <Link href="/products/men" className={inlineLinkClass}>
                Men&apos;s Bodybuilding clothes
              </Link>{" "}
              feature classic styles, with modern cuts and innovative fabrics to
              help you raise the bar.
            </p>
          </div>

          <div className="space-y-5">
            <h3 className="text-2xl font-black uppercase leading-tight tracking-normal sm:text-3xl">
              Activewear &amp; Athleisure
            </h3>
            <p>
              We create the tools that help everyone become their personal best
              - no matter the sport. Our range of Activewear is designed to give
              you the support you need to perform at your best, whether
              that&apos;s on the track, on the gym floor or in the studio.
            </p>
            <p>
              Whilst our{" "}
              <Link href="/products/men" className={inlineLinkClass}>
                men&apos;s
              </Link>{" "}
              and{" "}
              <Link href="/products/women" className={inlineLinkClass}>
                women&apos;s athleisure
              </Link>{" "}
              elevates your workouts with the most comfortable gym hoodies, the
              most supportive gym leggings and the most innovatively designed
              workout shirts that are made to move when it matters most.
            </p>
          </div>

          <div className="space-y-5">
            <h3 className="text-2xl font-black uppercase leading-tight tracking-normal sm:text-3xl">
              More Than Your Best Workout Clothing
            </h3>
            <p>
              The Gymshark community is devoted to unlocking potential through
              conditioning and the things we do today to prepare for tomorrow.
              It&apos;s every setback, step-up and milestone along the way.
              Game-changing workout clothing, running clothes and loungewear
              essentials. It&apos;s not just in the designs, it&apos;s in the
              people who wear them.
            </p>
            <p>
              Looking for more inspiration? Discover our latest tips, stories,
              and training insights on{" "}
              <Link href="/products" className={inlineLinkClass}>
                Gymshark Central
              </Link>{" "}
              - your next step towards becoming your personal best.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
