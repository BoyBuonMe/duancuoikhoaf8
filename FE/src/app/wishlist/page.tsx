import type { Metadata } from "next";
import { WishlistView } from "@/components/pages/WishlistView";

export const metadata: Metadata = {
  title: "Your Wishlist | Gymshark",
};

export default function WishlistPage() {
  return <WishlistView />;
}
