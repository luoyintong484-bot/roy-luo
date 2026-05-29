import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import HeroSection from "@/sections/HeroSection";
import DailyFortune from "@/sections/DailyFortune";
import Footer from "@/sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <DailyFortune />
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}
