import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import WellnessSection from "@/sections/WellnessSection";
import Footer from "@/sections/Footer";

export default function WellnessPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <WellnessSection />
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}
