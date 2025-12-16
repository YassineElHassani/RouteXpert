import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { 
  Truck, 
  Route, 
  Fuel, 
  Wrench, 
  Shield, 
  BarChart3,
  ChevronRight,
  Sparkles,
  Users,
  Clock,
  MapPin
} from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Fleet Tracking',
    description: 'Monitor your trucks and trailers in real-time with comprehensive status updates.',
  },
  {
    icon: Route,
    title: 'Route Management',
    description: 'Create and assign routes to drivers with detailed trip information.',
  },
  {
    icon: Fuel,
    title: 'Fuel Monitoring',
    description: 'Track diesel consumption and costs to optimize your fleet efficiency.',
  },
  {
    icon: Wrench,
    title: 'Maintenance Alerts',
    description: 'Get notified for scheduled maintenance like oil changes and tire replacements.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description: 'Secure access control for admins and drivers with tailored permissions.',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    description: 'Generate insights on mileage, fuel consumption, and fleet performance.',
  },
];

const stats = [
  { value: '99.9%', label: 'Uptime', icon: Clock },
  { value: '50K+', label: 'Trips Tracked', icon: MapPin },
  { value: '1000+', label: 'Active Users', icon: Users },
];

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-brand-black overflow-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass-dark"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold gradient-text">RouteXpert</span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <Button asChild variant="default" className="bg-brand-orange hover:bg-brand-orange/90 text-black">
                  <Link to="/dashboard">
                    Dashboard
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost" className="text-brand-grey hover:text-brand-orange hover:bg-brand-orange/10">
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild className="bg-brand-orange hover:bg-brand-orange/90 text-black">
                    <Link to="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Background Effects */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-orange/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-amber/10 rounded-full blur-[128px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange/10 border border-brand-orange/20 mb-6"
              >
                <span className="text-sm text-brand-orange font-medium">Trucks Trips Made Simple</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-grey leading-tight"
              >
                Drive Your Truck
                <span className="block gradient-text mt-2">With Confidence</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 text-lg text-brand-muted max-w-xl mx-auto lg:mx-0"
              >
                Provide you with a flexible international road freight transport service, with guarantees of safety and punctuality. 
                Optimize your operations, reduce costs, and keep your fleet running smoothly.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
              >
                {!user && (
                  <>
                    <Button asChild size="lg" className="bg-brand-orange hover:bg-brand-orange/90 text-black px-8 h-12 text-base glow-orange">
                      <Link to="/register">
                        Start Free Trial
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-brand-grey/20 text-brand-grey hover:bg-brand-grey/10 px-8 h-12 text-base">
                      <Link to="/login">Sign In</Link>
                    </Button>
                  </>
                )}
              </motion.div>

              {/* Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-12 flex items-center gap-8 justify-center lg:justify-start"
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                    <div className="text-sm text-brand-muted flex items-center gap-1 mt-1">
                      <stat.icon className="h-3 w-3" />
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Animation */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1 w-full max-w-lg lg:max-w-xl"
            >
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="absolute ml-40 inset-5 bg-linear-to-r from-brand-orange/20 to-brand-amber/20 rounded-2xl blur-2xl" />
                <div className="relative rounded-3xl p-4 h-[400px] w-[max-content]">
                  <DotLottieReact
                    src="truck_animation.json" 
                    loop
                    autoplay
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-grey">
              Everything You Need to
              <span className="gradient-text"> Start Your Journey</span>
            </h2>
            <p className="mt-4 text-lg text-brand-muted max-w-2xl mx-auto">
              Through Morocco, our trucks will deliver your goods as soon as possible thanks to the great experience (in terms of knowledge of the roads: excellent driving) of our drivers or those of our collaborators.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <div className="relative h-full p-6 rounded-2xl bg-brand-dark/50 border border-white/5 hover:border-brand-orange/20 transition-all duration-300">
                  <div className="absolute inset-0 bg-linear-to-br from-brand-orange/0 to-brand-orange/0 group-hover:from-brand-orange/5 group-hover:to-transparent rounded-2xl transition-all duration-500" />
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="inline-flex p-3 rounded-xl bg-brand-orange/10 text-brand-orange mb-4"
                    >
                      <feature.icon className="h-6 w-6" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-brand-grey mb-2">{feature.title}</h3>
                    <p className="text-brand-muted">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl"
          >
            <div className="absolute inset-0 bg-linear-to-r from-brand-orange to-brand-amber opacity-90" />
            <div className="absolute inset-0 grid-pattern opacity-20" />
            
            <div className="relative px-8 py-16 sm:px-16 text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-bold text-black"
              >
                Ready to Transform Your Trips to next level?
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="mt-4 text-lg text-black/70 max-w-2xl mx-auto"
              >
                Join thousands of companies already using RouteXpert to optimize their operations.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-8"
              >
                <Button asChild size="lg" className="bg-black hover:bg-black/90 text-white px-8 h-12 text-base">
                  <Link to="/register">
                    Get Started Today
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-brand-grey">RouteXpert</span>
            </div>
            <p className="text-sm text-brand-muted">
              © {new Date().getFullYear()} RouteXpert. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
