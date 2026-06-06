import Navbar from "./Navbar";
import Footer from "@/sections/Footer";
import CustomerService from "./CustomerService";

interface InnerPageLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  showNav?: boolean;
}

export default function InnerPageLayout({ children, showFooter = true, showNav = true }: InnerPageLayoutProps) {
  return (
    <div className="min-h-screen relative">
      <div className="relative z-10">
        {showNav && <Navbar />}
        {children}
        {showFooter && <Footer />}
        <CustomerService />
      </div>
    </div>
  );
}
