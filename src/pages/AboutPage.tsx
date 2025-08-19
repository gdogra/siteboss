import About from '@/components/About';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <About />
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;