import Link from 'next/link';
import Image from 'next/image';

// Server Component — accessible without authentication (AUTH-05)
export default function HomePage() {
  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-4">
            <Image
              src="/Ekklesia_Agora.jpg"
              alt="Ekklesia Agora"
              width={160}
              height={160}
              className="rounded-full border border-gold/30 object-cover"
            />
          </div>
          <h1 className="font-cinzel-dec text-4xl md:text-6xl lg:text-7xl text-gold mb-6 leading-tight">
            Ekklesia Agora
          </h1>
          <p className="font-garamond text-xl md:text-2xl text-text-light max-w-2xl mx-auto mb-4 italic">
            A Gathering Place for the Eastern Orthodox Community
          </p>
          <p className="font-garamond text-base md:text-lg text-text-mid max-w-xl mx-auto mb-10">
            Share videos, discuss the Faith, read Scripture and the Church Fathers,
            and connect with the Orthodox faithful around the world.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 font-cinzel text-sm uppercase tracking-widest text-navy bg-gold rounded hover:bg-gold-bright transition-colors shadow-lg"
          >
            Join the Community
          </Link>
        </div>

        {/* Decorative gold divider */}
        <div className="mt-20 flex items-center justify-center gap-4">
          <div className="h-px flex-1 max-w-xs bg-gradient-to-r from-transparent to-gold/30" />
          <div className="w-2 h-2 rounded-full bg-gold/40" />
          <div className="h-px flex-1 max-w-xs bg-gradient-to-l from-transparent to-gold/30" />
        </div>
      </section>

      {/* Feature Preview Cards */}
      <section className="px-4 pb-20 max-w-6xl mx-auto">
        <h2 className="font-cinzel text-center text-gold text-sm uppercase tracking-[0.3em] mb-12">
          Coming Together in Christ
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card: Orthodox Video */}
          <div className="bg-navy-mid border border-gold/15 rounded-[6px] p-6 hover:border-gold/30 transition-colors">
            <div className="w-10 h-10 rounded border border-gold/30 bg-gold/10 flex items-center justify-center mb-4">
              <span className="text-gold text-lg">&#9654;</span>
            </div>
            <h3 className="font-cinzel text-gold text-sm uppercase tracking-widest mb-2">
              Orthodox Video
            </h3>
            <p className="font-garamond text-text-mid text-sm leading-relaxed">
              Sermons, lectures, liturgical services, and educational content from
              canonically Eastern Orthodox sources worldwide.
            </p>
          </div>

          {/* Card: The Agora */}
          <div className="bg-navy-mid border border-gold/15 rounded-[6px] p-6 hover:border-gold/30 transition-colors">
            <div className="w-10 h-10 rounded border border-gold/30 bg-gold/10 flex items-center justify-center mb-4">
              <span className="text-gold text-lg">&#128483;</span>
            </div>
            <h3 className="font-cinzel text-gold text-sm uppercase tracking-widest mb-2">
              The Agora
            </h3>
            <p className="font-garamond text-text-mid text-sm leading-relaxed">
              A community feed for the Orthodox faithful — share reflections,
              ask questions, and discuss the Faith in a spirit of love and truth.
            </p>
          </div>

          {/* Card: Scripture Library */}
          <div className="bg-navy-mid border border-gold/15 rounded-[6px] p-6 hover:border-gold/30 transition-colors">
            <div className="w-10 h-10 rounded border border-gold/30 bg-gold/10 flex items-center justify-center mb-4">
              <span className="text-gold text-lg">&#128214;</span>
            </div>
            <h3 className="font-cinzel text-gold text-sm uppercase tracking-widest mb-2">
              Scripture Library
            </h3>
            <p className="font-garamond text-text-mid text-sm leading-relaxed">
              The Holy Scriptures in the Orthodox tradition — Brenton&apos;s Septuagint
              (Old Testament) and the Eastern Orthodox Bible (New Testament).
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-4 py-16 text-center border-t border-gold/10">
        <p className="font-garamond text-text-mid text-lg italic mb-6">
          &ldquo;Where two or three are gathered together in My name, I am there in the midst of them.&rdquo;
        </p>
        <p className="font-cinzel text-text-mid text-xs uppercase tracking-widest mb-8">
          Matthew 18:20
        </p>
        <Link
          href="/register"
          className="inline-block px-8 py-3 font-cinzel text-sm uppercase tracking-widest text-navy bg-gold rounded hover:bg-gold-bright transition-colors"
        >
          Create a Free Account
        </Link>
      </section>

    </div>
  );
}
