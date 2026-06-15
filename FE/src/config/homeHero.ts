const fallbackHeroImageSrc =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2400&q=85";

export const homeHeroMedia = {
  desktopVideoSrc:
    process.env.NEXT_PUBLIC_HOME_BRATZ_HERO_VIDEO_DESKTOP_URL ||
    "https://res.cloudinary.com/dlbc6kvrf/video/upload/v1781019859/BRATZ_DESKTOP_V2_1_lqo0ls.mp4",
  mobileVideoSrc:
    process.env.NEXT_PUBLIC_HOME_BRATZ_HERO_VIDEO_MOBILE_URL ||
    process.env.NEXT_PUBLIC_HOME_BRATZ_HERO_VIDEO_DESKTOP_URL ||
    "https://res.cloudinary.com/dlbc6kvrf/video/upload/v1781019859/BRATZ_DESKTOP_V2_1_lqo0ls.mp4",
  posterSrc:
    process.env.NEXT_PUBLIC_HOME_BRATZ_HERO_POSTER_URL ||
    "https://res.cloudinary.com/dlbc6kvrf/video/upload/so_1/v1781019859/BRATZ_DESKTOP_V2_1_lqo0ls.jpg",
  fallbackImageSrc: fallbackHeroImageSrc,
  alt: "Athletes training in Gymshark x Bratz gym wear",
  videoLabel: "Gymshark x Bratz campaign video",
};

export const premiumLiftersHeroMedia = {
  desktopVideoSrc:
    process.env.NEXT_PUBLIC_HOME_PREMIUM_HERO_VIDEO_DESKTOP_URL ||
    "https://res.cloudinary.com/dlbc6kvrf/video/upload/v1781019855/GSLC_8x3_WEB_BANNER_e45rub.mp4",
  mobileVideoSrc:
    process.env.NEXT_PUBLIC_HOME_PREMIUM_HERO_VIDEO_MOBILE_URL ||
    process.env.NEXT_PUBLIC_HOME_PREMIUM_HERO_VIDEO_DESKTOP_URL ||
    "https://res.cloudinary.com/dlbc6kvrf/video/upload/v1781019855/GSLC_8x3_WEB_BANNER_e45rub.mp4",
  posterSrc:
    process.env.NEXT_PUBLIC_HOME_PREMIUM_HERO_POSTER_URL ||
    "https://res.cloudinary.com/dlbc6kvrf/video/upload/so_1/v1781019855/GSLC_8x3_WEB_BANNER_e45rub.jpg",
  fallbackImageSrc: fallbackHeroImageSrc,
  alt: "Athlete training in the Premium Lifter's Collection",
  videoLabel: "Premium Lifter's Collection campaign video",
};
