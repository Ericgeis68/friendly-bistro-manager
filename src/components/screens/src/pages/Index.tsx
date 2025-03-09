
import React from 'react';
import RestaurantApp from '../components/RestaurantApp';
import { RestaurantProvider } from '../context/RestaurantContext';

const Index = () => {
  return (
    <RestaurantProvider>
      <RestaurantApp />
    </RestaurantProvider>
  );
};

export default Index;
