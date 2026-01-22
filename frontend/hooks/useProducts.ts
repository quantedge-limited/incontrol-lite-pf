// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useProducts = () => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['products'],
    queryFn: productApi.list,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId: string) => cartApi.add(productId),
    onMutate: async (productId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['cart']);
      
      // Snapshot previous value
      const previousCart = queryClient.getQueryData(['cart']);
      
      // Optimistically update
      queryClient.setQueryData(['cart'], (old: any) => {
        return { ...old, items: [...old.items, { productId, quantity: 1 }] };
      });
      
      return { previousCart };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
  });
};