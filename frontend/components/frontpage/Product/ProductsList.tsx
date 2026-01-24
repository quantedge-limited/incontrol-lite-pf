'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { apiService } from '@/services/api';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  inStock: boolean;
  image_path: string | null;
  quantity: number;
  brand: string;
  supplier?: string;
}

export const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch public products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const data = await apiService.getCustomerProducts();

        // In ProductsList component
        const mapped: Product[] = data
          .filter((item: any) => item.is_active && item.quantity > 0)
          .map((item: any) => ({
            id: item.id.toString(), // Keep as string if that's what your CardContext expects
            name: item.name,
            price: item.price_per_unit,
            description: item.description ?? '',
            inStock: item.quantity > 0,
            image_path: item.image_path ?? null,
            quantity: item.quantity,
            brand: item.brand_name?.trim(),
            supplier: item.supplier_name,
          }));

        setProducts(mapped);
      } catch (err) {
        console.error(err);
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Unique brand names (clean + sorted)
  const brands = Array.from(
    new Set(products.map(p => p.brand).filter(Boolean))
  ).sort();

  // Filter products by brand
  const filteredProducts = selectedBrand
    ? products.filter(p => p.brand === selectedBrand)
    : [];

  const getProductCount = (brand: string) =>
    products.filter(p => p.brand === brand).length;

  if (loading) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Loading products...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      {/* Header */}
      <div className="text-center mb-14">
        <h2 className="text-4xl font-bold mb-3">
          Our <span className="text-[#0091AD]">Products</span>
        </h2>
        <p className="text-gray-600">
          Browse products by brand. Live inventory available.
        </p>
      </div>

      {/* BRAND VIEW */}
      {!selectedBrand && (
        <div>
          <h3 className="text-xl font-semibold text-center mb-8">
            Select a Brand
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {brands.map(brand => (
              <motion.button
                key={brand}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedBrand(brand)}
                className="border-2 rounded-lg p-6 text-center font-semibold transition"
                style={{
                  borderColor: '#0091AD',
                  color: '#0091AD',
                  backgroundColor: '#e6f7fb',
                }}
              >
                <div className="text-lg">{brand}</div>
                <div className="text-sm opacity-75">
                  {getProductCount(brand)} products
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* PRODUCT VIEW */}
      {selectedBrand && (
        <>
          <button
            onClick={() => setSelectedBrand(null)}
            className="mb-6 px-4 py-2 bg-[#0091AD] text-white rounded-md font-semibold"
          >
            ← Back to Brands
          </button>

          {filteredProducts.length === 0 ? (
            <p className="text-center text-gray-500">
              No products available for this brand.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};
