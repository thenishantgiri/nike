import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CartBoot from "@/components/cart/CartBoot";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <CartBoot />
      {children}
      <Footer />
    </>
  );
}
