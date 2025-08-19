import Projects from '@/components/Projects';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ProjectsPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <Projects />
      </main>
      <Footer />
    </div>
  );
};

export default ProjectsPage;