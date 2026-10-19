import CustomCursor from '@/components/CustomCursor';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Approach from '@/components/Approach';
import Marquee from '@/components/Marquee';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import ScrollEffects from '@/components/ScrollEffects';

export default function Home() {
  return (
    <>
      <CustomCursor />
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Services />
        <Approach />
        <Marquee />
        <Contact />
      </main>
      <Footer />
      <ScrollEffects />
    </>
  );
}
