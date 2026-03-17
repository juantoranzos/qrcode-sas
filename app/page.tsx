import Link from "next/link";
import { QrCode, Store, Smartphone, Zap, Palette, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 font-sans selection:bg-red-500/30">

      {/* Navbar Minimalista */}
      <nav className="absolute top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-xl">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-neutral-900">QR SaaS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors hidden sm:block">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="text-sm font-bold bg-neutral-900 text-white px-5 py-2.5 rounded-full hover:bg-neutral-800 transition-all shadow-sm">
              Crear mi menú
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-red-500 opacity-20 blur-[100px]"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-sm font-semibold mb-8">
            <Zap className="w-4 h-4 fill-current" />
            <span>Digitalizá tu local hoy mismo</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold text-neutral-900 tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
            El menú digital más <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">fácil</span> para tu restaurante.
          </h1>

          <p className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Sin comisiones, sin intermediarios. Creá tu menú en minutos, generá tu código QR y recibí a tus clientes con la mejor experiencia.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 text-base font-bold bg-red-600 text-white px-8 py-4 rounded-full hover:bg-red-700 transition-all shadow-lg shadow-red-600/25 hover:shadow-red-600/40 hover:-translate-y-0.5">
              Probalo gratis ahora
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#features" className="w-full sm:w-auto flex items-center justify-center gap-2 text-base font-semibold bg-white text-neutral-800 border-2 border-neutral-200 px-8 py-4 rounded-full hover:border-neutral-300 hover:bg-neutral-50 transition-all">
              Ver características
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">Todo lo que necesitás para vender más</h2>
            <p className="text-neutral-500 text-lg">Diseñado especialmente para locales gastronómicos que buscan independencia.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 hover:border-red-200 hover:shadow-lg hover:shadow-red-100/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-neutral-100 mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">100% Autogestionable</h3>
              <p className="text-neutral-600 leading-relaxed">
                Pausá productos sin stock, cambiá precios al instante y agregá fotos nuevas. Todo desde tu celular, sin depender de nadie.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 hover:border-red-200 hover:shadow-lg hover:shadow-red-100/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-neutral-100 mb-6 group-hover:scale-110 transition-transform">
                <Palette className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Tu propia Marca</h3>
              <p className="text-neutral-600 leading-relaxed">
                Olvidate de los diseños genéricos. Subí tu logo y configurá los colores de tu local para que el menú sea una extensión de tu marca.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 hover:border-red-200 hover:shadow-lg hover:shadow-red-100/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-neutral-100 mb-6 group-hover:scale-110 transition-transform">
                <Store className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Gestión de Horarios</h3>
              <p className="text-neutral-600 leading-relaxed">
                Configurá qué días y a qué horas abrís. El sistema mostrará si estás abierto automáticamente a tus clientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-neutral-900 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Tu menú digital en 3 simples pasos</h2>
              <p className="text-neutral-400 text-lg mb-12">No necesitás saber de programación ni contratar diseñadores. Así de fácil es empezar:</p>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center font-bold text-xl border border-red-500/30">1</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Creá tu cuenta</h4>
                    <p className="text-neutral-400">Registrate gratis y reservá la URL única de tu local (ej: /menu/mi-pizzeria).</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center font-bold text-xl border border-red-500/30">2</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Cargá tus productos</h4>
                    <p className="text-neutral-400">Subí fotos, descripciones y precios. Organizá todo por categorías fácil de navegar.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center font-bold text-xl border border-red-500/30">3</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Descargá tu QR</h4>
                    <p className="text-neutral-400">Imprimí el código en alta calidad, ponelo en tus mesas y ¡listo para recibir clientes!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup visual representation */}
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 blur-[120px] opacity-20"></div>
              <div className="bg-neutral-800 border border-neutral-700 rounded-[2.5rem] p-4 shadow-2xl relative rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="bg-neutral-900 rounded-[2rem] overflow-hidden border border-neutral-700 aspect-[9/19] flex flex-col">
                  {/* Fake Menu UI inside */}
                  <div className="bg-red-600 pt-12 pb-6 px-6 rounded-b-[2rem]">
                    <div className="w-16 h-16 bg-white rounded-full mx-auto mb-3"></div>
                    <div className="h-6 w-32 bg-white/20 rounded mx-auto mb-4"></div>
                    <div className="h-10 w-full bg-white rounded-xl"></div>
                  </div>
                  <div className="p-6 flex-1 space-y-4">
                    <div className="flex gap-2 mb-6">
                      <div className="h-8 w-20 bg-neutral-800 rounded-full"></div>
                      <div className="h-8 w-20 bg-neutral-800 rounded-full"></div>
                    </div>
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-4 bg-neutral-800 p-3 rounded-2xl">
                        <div className="w-20 h-20 bg-neutral-700 rounded-xl"></div>
                        <div className="flex-1 py-1">
                          <div className="h-4 w-3/4 bg-neutral-700 rounded mb-2"></div>
                          <div className="h-3 w-1/2 bg-neutral-700 rounded mb-4"></div>
                          <div className="h-5 w-16 bg-red-600/50 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-red-600 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-6">¿Listo para modernizar tu negocio?</h2>
          <p className="text-red-100 text-xl mb-10">Unite a cientos de locales que ya ahorran tiempo y dinero con nuestro menú digital.</p>
          <Link href="/register" className="inline-flex items-center justify-center gap-2 text-lg font-bold bg-white text-red-600 px-10 py-5 rounded-full hover:bg-red-50 hover:scale-105 transition-all shadow-xl shadow-red-900/20">
            Crear mi cuenta gratis
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-50 py-12 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-red-600" />
            <span className="font-bold text-neutral-900">QR SaaS</span>
          </div>
          <p className="text-neutral-500 text-sm flex items-center gap-1">
            Hecho con <Heart className="w-4 h-4 text-red-500" /> para restaurantes.
          </p>
          <div className="flex gap-6 text-sm text-neutral-500">
            <a href="#" className="hover:text-red-600 transition-colors">Términos</a>
            <a href="#" className="hover:text-red-600 transition-colors">Privacidad</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Icono extra
function Heart(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
}
