// hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/lib/api/productApi';

{/*
  
  useProducts hook returns a query object for fetching product data.
  It uses productApi.list to fetch the list of products.
  
  Note: Cart functionality is now handled by CartContext, not via API calls.
  */}


export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: productApi.list,
  });
};