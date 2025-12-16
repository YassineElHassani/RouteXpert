import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  Truck,
  Container,
  Circle,
  Route,
  BarChart3,
  Fuel,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Users,
  Settings,
} from 'lucide-react';

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Trucks',
    href: '/dashboard/trucks',
    icon: Truck,
  },
  {
    title: 'Trailers',
    href: '/dashboard/trailers',
    icon: Container,
  },
  {
    title: 'Tires',
    href: '/dashboard/tires',
    icon: Circle,
  },
  {
    title: 'Trips',
    href: '/dashboard/trips',
    icon: Route,
  },
  {
    title: 'Fuel Records',
    href: '/dashboard/fuel',
    icon: Fuel,
  },
  {
    title: 'Maintenance',
    href: '/dashboard/maintenance',
    icon: Wrench,
  },
  {
    title: 'Maintenance Rules',
    href: '/dashboard/maintenance-rules',
    icon: Settings,
  },
  {
    title: 'Drivers',
    href: '/dashboard/drivers',
    icon: Users,
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: BarChart3,
  },
];

const driverNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'My Trips',
    href: '/dashboard/trips',
    icon: Route,
  },
  {
    title: 'Fuel Records',
    href: '/dashboard/fuel',
    icon: Fuel,
  },
];

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = user?.role === 'admin' ? adminNavItems : driverNavItems;

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="relative flex flex-col h-screen bg-brand-dark border-r border-white/5"
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-white/5">
          <Link to="/dashboard" className="flex items-center gap-3">
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-lg font-bold gradient-text"
                >
                  RouteXpert
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item, index) => {
              const active = isActive(item.href);
              
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link to={item.href}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ x: 4 }}
                        className={cn(
                          'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                          active
                            ? 'bg-brand-orange/10 text-brand-orange'
                            : 'text-brand-muted hover:bg-white/5 hover:text-brand-grey'
                        )}
                      >
                        <div className={cn(
                          'relative flex items-center justify-center',
                          isCollapsed && 'mx-auto'
                        )}>
                          <item.icon className={cn(
                            'w-5 h-5 transition-transform duration-200',
                            active && 'scale-110'
                          )} />
                          {active && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute -left-3 w-1 h-5 bg-brand-orange rounded-r-full"
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          )}
                        </div>
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.2 }}
                              className="text-sm font-medium"
                            >
                              {item.title}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="bg-brand-dark border-white/10">
                      {item.title}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User Role Badge */}
        <div className="p-4 border-t border-white/5">
          <AnimatePresence>
            {!isCollapsed ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-brand-navy/50"
              >
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  user?.role === 'admin' ? 'bg-purple-400' : 'bg-cyan-400'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-brand-muted truncate">Logged in as</p>
                  <p className="text-sm font-medium text-brand-grey truncate capitalize">
                    {user?.role || 'User'}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center"
              >
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  user?.role === 'admin' ? 'bg-purple-400' : 'bg-cyan-400'
                )} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-120 w-8 h-8 rounded-full bg-brand-orange border border-white/10 hover:bg-brand-orange/10 hover:border-brand-orange/20 hover:text-brand-orange"
        >
          {isCollapsed ? (
            <ChevronRight className="w-10 h-10" />
          ) : (
            <ChevronLeft className="w-10 h-10" />
          )}
        </Button>
      </motion.aside>
    </TooltipProvider>
  );
};

export default Sidebar;
