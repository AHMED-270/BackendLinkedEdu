export default function AuthHero() {
  return (
    <section className="relative hidden lg:flex flex-col justify-center items-start p-16 w-1/2 min-h-screen overflow-hidden bg-gradient-to-br from-brand-navy via-[#1E3A8A] to-brand-teal">
      {/* Decorative Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-brand-teal/30 rounded-full blur-[120px] mix-blend-screen opacity-70 animate-pulse-glow"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-brand-teal/20 rounded-full blur-[140px] mix-blend-screen animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-[90px] mix-blend-overlay"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgwem0zOSAzOVYxaC0ydjM4aDJ6TTIgMzlWMWgtMnYzOGgyem0zNy0zOHYyaC0zOFYxaDM4eiIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] opacity-30"></div>

      <div className="relative z-10 text-white w-full max-w-xl animate-slide-up">
        <p className="text-sm font-bold tracking-[0.2em] mb-4 uppercase text-brand-teal/80 drop-shadow-md">LinkEdu</p>
        <h1 className="text-5xl xl:text-6xl font-extrabold leading-tight mb-6 tracking-tight drop-shadow-lg">
          Connecter.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-teal-200">Apprendre.</span><br />
          Grandir.
        </h1>
        <p className="text-lg text-blue-100/80 font-medium max-w-md leading-relaxed">
          La plateforme numérique d'excellence pour une éducation moderne.
        </p>

        {/* Decorative glass card mockups */}
        <div className="mt-16 flex gap-4 opacity-80">
          <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-4 w-48 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="h-8 w-8 bg-blue-400/30 rounded-full mb-3"></div>
            <div className="h-2 w-24 bg-white/20 rounded mb-2"></div>
            <div className="h-2 w-16 bg-white/10 rounded"></div>
          </div>
          <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-4 w-48 animate-fade-in translate-y-6" style={{ animationDelay: '0.4s' }}>
            <div className="h-8 w-8 bg-teal-400/30 rounded-lg mb-3"></div>
            <div className="h-2 w-20 bg-white/20 rounded mb-2"></div>
            <div className="h-2 w-12 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
