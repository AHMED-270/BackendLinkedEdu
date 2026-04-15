import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import SecretaireSidebar from './SecretaireSidebar';

export default function SecretaireLayout({ children }) {
  const { user } = useAuth();
  const role = String(user?.role || '').toLowerCase();
  const sectionLabel = role === 'comptable' ? 'Comptable' : 'Secrétariat';

  return (
    <div className="premium-bg flex h-screen w-screen overflow-hidden fixed inset-0 text-slate-800 font-sans relative">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-[10%] -top-[10%] h-[700px] w-[700px] rounded-full bg-gradient-to-br from-brand-teal/20 to-blue-400/10 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-[15%] -left-[5%] h-[800px] w-[800px] rounded-full bg-gradient-to-tr from-brand-navy/10 to-brand-teal/15 blur-[140px]"
        />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />
      </div>

      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="premium-sidebar w-[280px] flex-shrink-0 flex flex-col z-50 relative overflow-hidden"
      >
        <div className="relative h-full py-4 px-3 overflow-y-auto custom-scrollbar">
          <SecretaireSidebar />
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className="h-[72px] flex-shrink-0 z-40"
        >
          <Header variant="shell" />
        </motion.header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="p-6 lg:p-8 max-w-[1600px] mx-auto"
          >
            <div className="mb-6 flex flex-col gap-1">
              <span className="text-brand-teal font-semibold text-xs uppercase tracking-[0.2em]">{sectionLabel}</span>
            </div>
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
