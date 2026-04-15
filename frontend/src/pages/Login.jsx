import AuthHero from '../components/AuthHero';
import LoginCard from '../components/LoginCard';
import { motion } from 'framer-motion';
// import './Auth.css'; // Remove old styles that fight Tailwind

export default function Login() {
  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen w-full bg-[#fdfbfb] md:bg-brand-light relative overflow-hidden backdrop-saturate-150"
    >
      <AuthHero />
      <div className="flex flex-1 items-center justify-center p-4 md:p-10 w-full lg:w-1/2 relative overflow-hidden bg-[linear-gradient(to_bottom_right,#f0f9ff,#fdfbfb,#ebf4f5)]">
        {/* Subtle right-side glowing backdrop for the form */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-brand-light/40 rounded-full blur-[100px] mix-blend-darken pointer-events-none"></div>
        
        <LoginCard />
      </div>
    </motion.main>
  );
}


