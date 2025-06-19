import React from 'react';
import { Link } from 'react-router-dom';
import Card, { CardImage, CardContent, CardTitle } from '../ui/Card';

const categories = [
  {
    id: 'clay',
    name: 'Clay Bricks',
    description: 'Traditional clay bricks known for durability and classic appearance',
    image: 'https://images.pexels.com/photos/207142/pexels-photo-207142.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: 'concrete',
    name: 'Concrete Bricks',
    description: 'Modern concrete bricks offering strength and versatility',
    image: 'https://images.pexels.com/photos/2523609/pexels-photo-2523609.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: 'facade',
    name: 'Facade Bricks',
    description: 'Decorative bricks designed for exterior visual appeal',
    image: 'https://images.pexels.com/photos/2506990/pexels-photo-2506990.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: 'specialty',
    name: 'Specialty Bricks',
    description: 'Unique bricks for specific architectural requirements',
    image: 'https://images.pexels.com/photos/1755288/pexels-photo-1755288.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
];

const FeaturedCategories: React.FC = () => {
  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-800 mb-4">Explore Our Brick Categories</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Find the perfect bricks for your project from our extensive selection of high-quality products
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link to={`/catalog?type=${category.id}`} key={category.id}>
              <Card hoverEffect className="h-full">
                <CardImage src={category.image} alt={category.name} />
                <CardContent>
                  <CardTitle>{category.name}</CardTitle>
                  <p className="text-neutral-600">{category.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;