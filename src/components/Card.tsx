import React from 'react';
import Image from 'next/image';

interface CardProps {
  title: string;
  category: string;
  price: number;
  image: string;
  colors?: number;
  badge?: string;
}

export default function Card({ 
  title, 
  category, 
  price, 
  image, 
  colors = 1,
  badge 
}: CardProps) {
  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden bg-light-200 rounded-lg">
        {badge && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-red text-light-100 px-3 py-1 rounded-full font-jost text-caption font-medium">
              {badge}
            </span>
          </div>
        )}
        
        <div className="aspect-square w-full">
          <Image
            src={image}
            alt={title}
            width={400}
            height={400}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div>
          <h3 className="font-jost text-body-medium font-medium text-dark-900 group-hover:text-dark-700">
            {title}
          </h3>
          <p className="font-jost text-caption text-dark-700">
            {category}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="font-jost text-body-medium font-medium text-dark-900">
            ${price.toFixed(2)}
          </p>
          
          {colors > 1 && (
            <p className="font-jost text-caption text-dark-700">
              {colors} Colour{colors !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
