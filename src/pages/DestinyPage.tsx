import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import DestinySection from "@/sections/DestinySection";
import Footer from "@/sections/Footer";

export default function DestinyPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <DestinySection />
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}
