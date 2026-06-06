import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import TarotSection from "@/sections/TarotSection";
import Footer from "@/sections/Footer";

export default function TarotPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <TarotSection />
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}
