// components/frontend/Product/ProductList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { apiService } from '@/services/api';
import { InventoryItem } from '@/types/inventory';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  inStock: boolean;
  image: string;
  brand: string;
  quantity: number;
}

const DEFAULT_PRODUCTS: Product[] = [
  // Your existing default products...
  // Add quantity to each
  { id: '1', name: 'Softcare Gold Mini (Low Count)', price: 150, description: 'Premium mini diapers for newborns', inStock: true, image: 'softcare-mini', brand: 'Softcare', quantity: 10 },
  // ... rest of your products with quantity field
];

export const ProductsList: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const inventoryData: InventoryItem[] = await apiService.getInventory();
        
        // Transform inventory data to product format
        const apiProducts = inventoryData.map(item => ({
          id: item.id.toString(),
          name: item.name,
          price: item.price_per_unit,
          description: item.description || `Available quantity: ${item.quantity}`,
          inStock: item.quantity > 0,
          image: '', // You might want to add an image field to your Inventory model
          brand: item.supplier_name || 'Generic',
          quantity: item.quantity
        }));

        // Merge with default products (prioritize API data)
        const mergedProducts = [...apiProducts];
        
        // Add default products that aren't in API
        DEFAULT_PRODUCTS.forEach(defaultProduct => {
          const exists = mergedProducts.find(p => p.name === defaultProduct.name);
          if (!exists) {
            mergedProducts.push(defaultProduct);
          }
        });

        setProducts(mergedProducts);
      } catch (err) {
        setError('Failed to load products. Using default products.');
        console.error('Error fetching products:', err);
        // Fallback to default products
        setProducts(DEFAULT_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Get unique brands from products
  const brands = Array.from(new Set(products.map(p => p.brand))).sort();
  
  // Filter products based on selected brand
  const filteredProducts = selectedBrand 
    ? products.filter(p => p.brand === selectedBrand)
    : [];

  // Count products per brand
  const getProductCount = (brand: string) => {
    return products.filter(p => p.brand === brand).length;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Loading Products...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0091AD] mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Our Premium <span style={{ color: '#0091AD' }}>Products</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover our carefully selected range of household and personal care products. Real-time inventory tracking.
        </p>
      </motion.div>

      {!selectedBrand ? (
        <>
          {/* Brands Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Select a Brand</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {brands.map((brand) => {
                const productCount = getProductCount(brand);
                return (
                  <motion.button
                    key={brand}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedBrand(brand)}
                    className="p-6 rounded-lg border-2 transition-all"
                    style={{
                      borderColor: '#0091AD',
                      backgroundColor: '#e6f7fb',
                      color: '#0091AD',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0091AD';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#e6f7fb';
                      e.currentTarget.style.color = '#0091AD';
                    }}
                  >
                    <div className="font-bold text-lg">{brand}</div>
                    <div className="text-sm opacity-75">{productCount} products</div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </>
      ) : (
        <>
          {/* Back Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedBrand(null)}
            className="mb-8 px-6 py-2 rounded-lg font-semibold text-white transition-colors"
            style={{ backgroundColor: '#0091AD' }}
          >
            ← Back to Brands
          </motion.button>

          {/* Products Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard {...product} />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </section>
  );
};