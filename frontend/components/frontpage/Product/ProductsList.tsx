'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  inStock: boolean;
  image: string;
  brand: string;
}

const PRODUCTS: Product[] = [
  // Diapers - Softcare
  { id: '1', name: 'Softcare Gold Mini (Low Count)', price: 150, description: 'Premium mini diapers for newborns', inStock: true, image: 'softcare-mini', brand: 'Softcare' },
  { id: '2', name: 'Softcare Gold Medium 10s', price: 680, description: 'Soft medium size diapers', inStock: true, image: 'softcare-medium', brand: 'Softcare' },
  { id: '3', name: 'Softcare Premium H/C', price: 650, description: 'High capacity premium diapers', inStock: true, image: 'softcare-premium', brand: 'Softcare' },
  { id: '4', name: 'Softcare Premium Jumbo', price: 1050, description: 'Extra large jumbo diapers', inStock: true, image: 'softcare-jumbo', brand: 'Softcare' },
  { id: '5', name: 'Softcare Space H/C', price: 680, description: 'Space series high capacity', inStock: true, image: 'softcare-space', brand: 'Softcare' },
  { id: '10', name: 'Space/Softcare Gold (per piece)', price: 20, description: 'Individual diapers', inStock: true, image: 'single-diaper', brand: 'Softcare' },
  
  // Diapers - Other brands
  { id: '6', name: 'Naya Diapers H/C', price: 500, description: 'Naya high capacity diapers', inStock: true, image: 'naya-diapers', brand: 'Naya' },
  { id: '7', name: 'KissKids Diapers H/C', price: 500, description: 'KissKids high capacity', inStock: true, image: 'kisskids', brand: 'KissKids' },
  { id: '8', name: 'Molfix Diapers H/C', price: 700, description: 'Molfix high capacity diapers', inStock: true, image: 'molfix-hc', brand: 'Molfix' },
  { id: '9', name: 'Molfix Diapers (per piece)', price: 25, description: 'Individual Molfix diapers', inStock: true, image: 'molfix-single', brand: 'Molfix' },
  
  // Sanitary Pads - Softcare
  { id: '11', name: 'Softcare Normal Pads', price: 75, description: 'Softcare normal flow pads', inStock: true, image: 'softcare-pads', brand: 'Softcare' },
  { id: '12', name: 'Softcare Extra Long (320mm)', price: 75, description: 'Extra long for heavy flow', inStock: true, image: 'softcare-long', brand: 'Softcare' },
  { id: '13', name: 'Softcare Safe Model (240mm)', price: 75, description: 'Softcare safe model', inStock: true, image: 'softcare-safe', brand: 'Softcare' },
  { id: '14', name: '6 Pads (Wholesale Price)', price: 400, description: 'Pack of 6 at wholesale', inStock: true, image: 'pads-6pack', brand: 'Softcare' },
  
  // Wet Wipes
  { id: '15', name: 'Softcare Wipes (80pcs)', price: 150, description: 'Softcare 80 piece pack', inStock: true, image: 'softcare-wipes', brand: 'Softcare' },
  { id: '16', name: 'Bella Wipes (80pcs)', price: 130, description: 'Bella 80 piece wipes', inStock: true, image: 'bella-wipes-80', brand: 'Bella' },
  { id: '17', name: 'Bella Wipes (40pcs)', price: 70, description: 'Bella 40 piece wipes', inStock: true, image: 'bella-wipes-40', brand: 'Bella' },
  
  // Serviettes
  { id: '18', name: 'Bella Serviettes', price: 90, description: 'Bella serviettes', inStock: true, image: 'bella-serviettes', brand: 'Bella' },
  { id: '19', name: 'Tiara Serviettes', price: 100, description: 'Tiara premium serviettes', inStock: true, image: 'tiara-serviettes', brand: 'Tiara' },
  
  // Bar Soaps
  { id: '20', name: 'Menengai Soap 1kg', price: 210, description: 'Menengai 1kg bar soap', inStock: true, image: 'menengai-1kg', brand: 'Menengai' },
  { id: '21', name: 'Menengai Soap 1/2kg', price: 110, description: 'Menengai 500g soap', inStock: true, image: 'menengai-500g', brand: 'Menengai' },
  { id: '22', name: 'Jamaa Soap 1kg', price: 195, description: 'Jamaa 1kg bar soap', inStock: true, image: 'jamaa-soap', brand: 'Jamaa' },
  
  // Washing Powders
  { id: '23', name: 'Doffi Washing Powder 500g', price: 80, description: 'Doffi detergent 500g', inStock: true, image: 'doffi-500g', brand: 'Doffi' },
  { id: '24', name: 'Kleesoft Washing Powder 500g', price: 90, description: 'Kleesoft 500g powder', inStock: true, image: 'kleesoft-500g', brand: 'Kleesoft' },
  { id: '25', name: 'Kleesoft Washing Powder 1kg', price: 170, description: 'Kleesoft 1kg powder', inStock: true, image: 'kleesoft-1kg', brand: 'Kleesoft' },
  { id: '26', name: 'Msafi Washing Powder 500g', price: 125, description: 'Msafi 500g powder', inStock: true, image: 'msafi-500g', brand: 'Msafi' },
  { id: '27', name: 'Ariel Washing Powder 40g', price: 10, description: 'Ariel 40g small pack', inStock: true, image: 'ariel-40g', brand: 'Ariel' },
  
  // Softeners
  { id: '28', name: 'Downy Fabric Softener 20ml', price: 20, description: 'Downy 20ml softener', inStock: true, image: 'downy-softener', brand: 'Downy' },
  
  // Tissues - Jumbo
  { id: '29', name: 'Bella Jumbo Tissue', price: 45, description: 'Bella jumbo rolls', inStock: true, image: 'bella-jumbo', brand: 'Bella' },
  { id: '30', name: 'Tiara Jumbo Tissue', price: 70, description: 'Tiara jumbo rolls', inStock: true, image: 'tiara-jumbo', brand: 'Tiara' },
  
  // Tissues - Singles
  { id: '31', name: 'Lissy Orange Tissue', price: 15, description: 'Lissy orange tissue', inStock: true, image: 'lissy-orange', brand: 'Lissy' },
  { id: '32', name: 'Lissy Purple Tissue', price: 35, description: 'Lissy purple tissue', inStock: true, image: 'lissy-purple', brand: 'Lissy' },
  { id: '33', name: 'Pekee Poa Unwrapped Tissue', price: 20, description: 'Pekee unwrapped', inStock: true, image: 'pekee-unwrapped', brand: 'Pekee' },
  { id: '34', name: 'Dawn Pekee Tissue', price: 30, description: 'Dawn Pekee tissue', inStock: true, image: 'dawn-pekee', brand: 'Pekee' },
  { id: '35', name: 'Neptune Tissue Purple/Green', price: 40, description: 'Neptune tissue', inStock: true, image: 'neptune-tissue', brand: 'Neptune' },
  { id: '36', name: 'Bella Single Tissue', price: 40, description: 'Bella single tissue', inStock: true, image: 'bella-single', brand: 'Bella' },
  { id: '37', name: 'Toilex Single Tissue', price: 40, description: 'Toilex tissue', inStock: true, image: 'toilex-tissue', brand: 'Toilex' },
  { id: '38', name: 'Hanan Single Tissue', price: 55, description: 'Hanan tissue', inStock: true, image: 'hanan-tissue', brand: 'Hanan' },
  
  // Tissues - 10 packs
  { id: '39', name: 'Pekee Poa Unwrapped (10-pack)', price: 200, description: 'Pekee 10 pack', inStock: true, image: 'pekee-10pack', brand: 'Pekee' },
  { id: '40', name: 'Dawn Pekee Tissues (10-pack)', price: 260, description: 'Dawn Pekee 10 pack', inStock: true, image: 'dawn-10pack', brand: 'Pekee' },
  { id: '41', name: 'Neptune Tissues (10-pack)', price: 330, description: 'Neptune 10 pack', inStock: true, image: 'neptune-10pack', brand: 'Neptune' },
  { id: '42', name: 'Bella Tissues (10-pack)', price: 330, description: 'Bella 10 pack', inStock: true, image: 'bella-10pack', brand: 'Bella' },
  { id: '43', name: 'Toilex Tissues (10-pack)', price: 350, description: 'Toilex 10 pack', inStock: true, image: 'toilex-10pack', brand: 'Toilex' },
  { id: '44', name: 'Hanan Tissues (10-pack)', price: 500, description: 'Hanan 10 pack', inStock: true, image: 'hanan-10pack', brand: 'Hanan' },
  
  // Carrier Bags
  { id: '45', name: 'Carrier Bag #15', price: 10, description: 'Plastic bag size #15', inStock: true, image: 'bag-15', brand: 'Generic' },
  { id: '46', name: 'Carrier Bag #22', price: 15, description: 'Plastic bag size #22', inStock: true, image: 'bag-22', brand: 'Generic' },
  { id: '47', name: 'Carrier Bag #25', price: 20, description: 'Plastic bag size #25', inStock: true, image: 'bag-25', brand: 'Generic' },
  { id: '48', name: 'V22 Carrier Bag (Gunia)', price: 30, description: 'V22 woven gunia', inStock: true, image: 'bag-v22', brand: 'Generic' },
  { id: '49', name: 'V30 Carrier Bag (Gunia)', price: 50, description: 'V30 woven gunia', inStock: true, image: 'bag-v30', brand: 'Generic' },
  { id: '50', name: 'Coloured Carrier/Woven Bags', price: 50, description: 'Coloured woven bags', inStock: true, image: 'bag-coloured', brand: 'Generic' },
  
  // Drinking Water
  { id: '51', name: 'Planet Aqua Water 500ml', price: 40, description: 'Planet Aqua 500ml', inStock: true, image: 'aqua-500ml', brand: 'Planet Aqua' },
  { id: '52', name: 'Planet Aqua Water 1Ltr', price: 60, description: 'Planet Aqua 1 litre', inStock: true, image: 'aqua-1ltr', brand: 'Planet Aqua' },
];

export const ProductsList: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [displayProducts, setDisplayProducts] = useState<Product[]>(PRODUCTS);

  // Load products from localStorage and merge with defaults
  React.useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      try {
        const adminProducts = JSON.parse(savedProducts);
        // Merge admin products with default products
        const merged = [...PRODUCTS, ...adminProducts];
        setDisplayProducts(merged);
      } catch (error) {
        console.error('Failed to load products:', error);
        setDisplayProducts(PRODUCTS);
      }
    }
  }, []);

  // Get unique brands from products
  const brands = Array.from(new Set(displayProducts.map(p => p.brand))).sort();
  
  // Filter products based on selected brand
  const filteredProducts = selectedBrand 
    ? displayProducts.filter(p => p.brand === selectedBrand)
    : [];

  // Count products per brand
  const getProductCount = (brand: string) => {
    return displayProducts.filter(p => p.brand === brand).length;
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
          Discover our carefully selected range of household and personal care products from Mams Entreprise. Quality you can trust for your family.
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
