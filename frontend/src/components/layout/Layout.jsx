import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import { ScrollArea } from '@/components/ui/scroll-area';

const Layout = () => {
  return (
    <div className="flex h-screen bg-zinc-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header />
        
        <ScrollArea className="flex-1">
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {/* Background decorations */}
            <div className="fixed inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/5 rounded-full blur-[128px]" />
              <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-amber/5 rounded-full blur-[128px]" />
            </div>
            
            {/* Content */}
            <div className="relative z-10">
              <Outlet />
            </div>
          </motion.main>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Layout;
