import React from 'react';
import RestaurantApp from '../components/RestaurantApp';
import { RestaurantProvider, useRestaurant } from '../context/RestaurantContext';

const IndexContent = () => {
  const { cookingOptions, setCookingOptions } = useRestaurant();
  
  return (
    <RestaurantApp 
      cookingOptions={cookingOptions} 
      setCookingOptions={setCookingOptions} 
    />
  );
};

const Index = () => {
  return (
    <RestaurantProvider>
      <IndexContent />
    </RestaurantProvider>
  );
};

export default Index;
