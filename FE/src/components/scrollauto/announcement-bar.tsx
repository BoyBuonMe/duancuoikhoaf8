"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const announcements = [
  "🔥 Product A - 50% off",
  "⚡ Sản phẩm B - Mua 1 tặng 1",
  "🎁 Sản phẩm C - Flash sale hôm nay",
];

export function AnnouncementBar() {
  return (
    <div className="w-full bg-black text-white">
      <Carousel
        opts={{ loop: true }}
        plugins={[
          AutoScroll({
            startDelay: 3000,
            speed: 1,
            stopOnInteraction: false,
            stopOnMouseEnter: false,
          }),
        ]}
      >
        <CarouselContent>
          {announcements.map((text, i) => (
            <CarouselItem key={i} className="text-center text-sm py-2">
              {text}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
