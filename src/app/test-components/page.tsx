import React from 'react';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import Footer from '@/components/Footer';

export default function TestComponents() {
  return (
    <div className="min-h-screen bg-light-100">
      <Navbar cartItemCount={2} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-heading-2 font-jost font-bold text-dark-900 mb-8">Component Test Page</h1>
        
        <section className="mb-12">
          <h2 className="text-heading-3 font-jost font-medium text-dark-900 mb-6">Product Cards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
              title="Nike Air Force 1 Mid '07"
              category="Men's Shoes"
              price={98.30}
              image="/shoe-1.jpg"
              colors={6}
              badge="Best Seller"
            />
            <Card
              title="Nike Air Max 90"
              category="Men's Shoes"
              price={120.00}
              image="/hero-shoe.png"
              colors={4}
            />
            <Card
              title="Nike Jordan Retro"
              category="Basketball Shoes"
              price={150.00}
              image="/trending-1.png"
              colors={3}
            />
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
