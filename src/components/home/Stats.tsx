import React, { useState, useEffect } from 'react';
import { Truck, Users, Star, Calendar } from 'lucide-react';
import { mockStats } from '../../mocks/data';

const StatsSection: React.FC = () => {
  const [animatedStats, setAnimatedStats] = useState({
    totalBricksSupplied: 0,
    activeProjects: 0,
    customersSatisfied: 0,
    yearsInBusiness: 0,
  });

  useEffect(() => {
    const animationDuration = 2000; // ms
    const steps = 20;
    const interval = animationDuration / steps;

    const incrementValues = {
      totalBricksSupplied: Math.floor(mockStats.totalBricksSupplied / steps),
      activeProjects: Math.floor(mockStats.activeProjects / steps),
      customersSatisfied: Math.floor(mockStats.customersSatisfied / steps),
      yearsInBusiness: Math.floor(mockStats.yearsInBusiness / steps),
    };

    let currentStep = 0;

    const timer = setInterval(() => {
      if (currentStep >= steps) {
        // Set final values exactly to avoid rounding errors
        setAnimatedStats(mockStats);
        clearInterval(timer);
        return;
      }

      setAnimatedStats((prev) => ({
        totalBricksSupplied: Math.min(
          prev.totalBricksSupplied + incrementValues.totalBricksSupplied,
          mockStats.totalBricksSupplied
        ),
        activeProjects: Math.min(
          prev.activeProjects + incrementValues.activeProjects,
          mockStats.activeProjects
        ),
        customersSatisfied: Math.min(
          prev.customersSatisfied + incrementValues.customersSatisfied,
          mockStats.customersSatisfied
        ),
        yearsInBusiness: Math.min(
          prev.yearsInBusiness + incrementValues.yearsInBusiness,
          mockStats.yearsInBusiness
        ),
      }));

      currentStep++;
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M+';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K+';
    }
    return num.toString() + '+';
  };

  const stats = [
    {
      icon: <Truck className="w-8 h-8 text-primary-500" />,
      value: formatNumber(animatedStats.totalBricksSupplied),
      label: 'Bricks Supplied',
      originalValue: animatedStats.totalBricksSupplied,
    },
    {
      icon: <Calendar className="w-8 h-8 text-primary-500" />,
      value: formatNumber(animatedStats.activeProjects),
      label: 'Active Projects',
      originalValue: animatedStats.activeProjects,
    },
    {
      icon: <Users className="w-8 h-8 text-primary-500" />,
      value: formatNumber(animatedStats.customersSatisfied),
      label: 'Satisfied Customers',
      originalValue: animatedStats.customersSatisfied,
    },
    {
      icon: <Star className="w-8 h-8 text-primary-500" />,
      value: animatedStats.yearsInBusiness.toString() + '+',
      label: 'Years in Business',
      originalValue: animatedStats.yearsInBusiness,
    },
  ];

  return (
    <section className="py-16 bg-neutral-900 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center p-6 rounded-lg transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="mb-4 p-3 bg-neutral-800 rounded-full">{stat.icon}</div>
              <div 
                className="text-4xl font-bold mb-2 text-primary-500" 
                data-value={stat.originalValue}
              >
                {stat.value}
              </div>
              <div className="text-lg text-neutral-300 text-center">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;