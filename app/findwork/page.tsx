import Header from '@/components/organisms/Header';
import FindWork from '@/components/organisms/FindWork';
import Footer from '@/components/organisms/Footer';

export default function FindWorkPage() {
  return (
    <div className="relative min-h-screen bg-[#FAF8F5] overflow-x-hidden">
      <Header />
      <main className="pt-20">
        <FindWork />
      </main>
      <Footer />
    </div>
  );
}
