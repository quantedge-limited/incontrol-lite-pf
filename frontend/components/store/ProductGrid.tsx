// components/store/ProductGrid.tsx
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

export default function ProductGrid() {
  const { ref, inView } = useInView();
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['products'],
    queryFn: ({ pageParam = 1 }) => productApi.list(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div>
      {data?.pages.map((page) => (
        page.items.map(product => <ProductCard key={product.id} product={product} />)
      ))}
      <div ref={ref}>
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </div>
  );
}