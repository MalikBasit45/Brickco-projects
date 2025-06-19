import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { Brick } from '../../types';
import { mockBricks } from '../../mocks/data';

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredBricks, setFeaturedBricks] = useState<Brick[]>([]);

  useEffect(() => {
    // In a real app, this would be an API call
    setFeaturedBricks(mockBricks.filter(brick => brick.featured));

    // Auto-advance slides
    const interval = setInterval(() => {
      setCurrentSlide((prev) => 
        prev === featuredBricks.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredBricks.length]);

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Slides */}
      {featuredBricks.map((brick, index) => (
        <div
          key={brick.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            currentSlide === index ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${brick.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Build Your Vision With Quality Bricks
            </h1>
            <p className="text-xl text-neutral-200 mb-8">
              Premium materials for construction projects of all sizes. 
              Trusted by professionals for over 35 years.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/catalog">
                <Button size="lg">
                  Browse Catalog
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-neutral-900">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <div className="flex space-x-2">
          {featuredBricks.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentSlide === index
                  ? 'bg-white scale-110'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;