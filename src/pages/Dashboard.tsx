
import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import StocksPanel from "@/components/StocksPanel";
import ForexPanel from "@/components/ForexPanel";
import Footer from "@/components/Footer";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<"stocks" | "forex">("stocks");

  return (
    <div className="min-h-screen flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 container mx-auto px-4 py-8 animate-fade-in">
        {activeTab === "stocks" ? <StocksPanel /> : <ForexPanel />}
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
