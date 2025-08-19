import Contact from '@/components/Contact';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ContactPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;