import Navbar from '@/components/sections/Navbar';
import Hero from '@/components/sections/Hero';
import Services from '@/components/sections/Services';
import About from '@/components/sections/About';
import WhyChooseUs from '@/components/sections/WhyChooseUs';
import GallerySection from '@/components/sections/GallerySection';
import Pricing from '@/components/sections/Pricing';
import Testimonials from '@/components/sections/Testimonials';
import FAQ from '@/components/sections/FAQ';
import BookingSection from '@/components/sections/BookingSection';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';

export default function Home() {
  return (
    <>
      {/* Dynamic Navigation Header */}
      <Navbar />

      {/* Main Single Page Content */}
      <main>
        <Hero />
        <Services />
        <About />
        <WhyChooseUs />
        <GallerySection />
        <Pricing />
        <Testimonials />
        <FAQ />
        <BookingSection />
        <Contact />
      </main>

      {/* Footer Details & Admin Portal Link */}
      <Footer />
    </>
  );
}
