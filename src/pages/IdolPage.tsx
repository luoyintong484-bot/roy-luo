import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import IdolSection from "@/sections/IdolSection";
import Footer from "@/sections/Footer";

export default function IdolPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <IdolSection />
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}
