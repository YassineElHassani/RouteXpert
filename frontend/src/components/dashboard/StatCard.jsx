import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  description,
  className,
  delay = 0 
}) => {
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn('group', className)}
    >
      <Card className="relative overflow-hidden bg-brand-dark/50 border-white/5 hover:border-brand-orange/20 transition-all duration-300">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-linear-to-br from-brand-orange/0 to-brand-orange/0 group-hover:from-brand-orange/5 group-hover:to-transparent transition-all duration-500" />
        
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-orange/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-brand-muted">
            {title}
          </CardTitle>
          {Icon && (
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-2 rounded-lg bg-brand-orange/10 text-brand-orange"
            >
              <Icon className="h-4 w-4" />
            </motion.div>
          )}
        </CardHeader>
        <CardContent className="relative z-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: delay + 0.1 }}
            className="text-2xl font-bold text-brand-grey"
          >
            {value}
          </motion.div>
          {(trend || description) && (
            <div className="flex items-center gap-2 mt-1">
              {trend && (
                <span
                  className={cn(
                    'text-xs font-medium flex items-center gap-1',
                    isPositive && 'text-emerald-400',
                    isNegative && 'text-red-400',
                    !isPositive && !isNegative && 'text-brand-muted'
                  )}
                >
                  {isPositive && '↑'}
                  {isNegative && '↓'}
                  {trendValue}
                </span>
              )}
              {description && (
                <span className="text-xs text-brand-muted">{description}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;
