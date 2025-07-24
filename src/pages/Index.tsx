import React from 'react';
import RestaurantApp from '../components/RestaurantApp';
import { useRestaurant } from '../context/RestaurantContext';

const Index = () => {
  const { cookingOptions, setCookingOptions } = useRestaurant();
  
  return (
    <RestaurantApp 
      cookingOptions={cookingOptions} 
      setCookingOptions={setCookingOptions} 
    />
  );
};

export default Index;
