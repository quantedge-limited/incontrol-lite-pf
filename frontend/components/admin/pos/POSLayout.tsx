/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Search, ShoppingCart, RefreshCw, Grid, List, Filter } from 'lucide-react';
import { useState } from 'react';

interface CategoryOption {
  id: string | number;
  name: string;
}

interface POSLayoutProps {
  children: React.ReactNode;
  cartItemCount: number;
  onCartClick: () => void;
  onCheckout: () => void;
  checkoutDisabled: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string | number;
  onCategoryChange: (category: string | number) => void;
  categories: CategoryOption[];
  onRefresh: () => void;
  filteredProducts: any[];
}

export default function POSLayout({
  children,
  cartItemCount,
  onCartClick,
  onCheckout,
  checkoutDisabled,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onRefresh,
  filteredProducts,
}: POSLayoutProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCategories, setShowCategories] = useState(false);

  // Find the selected category name for display
  const selectedCategoryName = selectedCategory === 'all' 
    ? 'Categories' 
    : categories.find(cat => cat.id === selectedCategory)?.name || 'Categories';

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-3 md:px-6 py-3 shadow-sm">
        {/* Row 1: Title & Main Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 md:mb-0 md:flex-nowrap">
          <div className="flex items-center gap-2 md:gap-4">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 whitespace-nowrap">POS</h1>
            <button
              onClick={onRefresh}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh inventory"
            >
              <RefreshCw className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center gap-2 grow justify-end md:grow-0">
            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative p-2 md:p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full h-4 w-4 md:h-6 md:w-6 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Checkout Button */}
            <button
              onClick={onCheckout}
              disabled={checkoutDisabled}
              className="px-3 py-2 md:px-6 md:py-3 bg-blue-600 text-white text-xs md:text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Checkout
            </button>
          </div>
        </div>

        {/* Row 2: Search Bar (Full width on mobile) */}
        <div className="relative w-full md:max-w-md lg:max-w-lg mt-2 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:mt-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Row 3: Filters (Horizontal scroll on very small screens if needed) */}
        <div className="flex flex-wrap items-center justify-between mt-3 gap-2 border-t pt-2 md:pt-4 md:border-none">
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 text-xs md:text-sm whitespace-nowrap"
              >
                <Filter className="h-3 w-3" />
                <span className="font-medium truncate max-w-20 md:max-w-none">
                  {selectedCategoryName}
                </span>
              </button>

              {showCategories && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                  <div className="p-1 max-h-60 overflow-y-auto">
                    {/* All Categories Option */}
                    <button
                      onClick={() => {
                        onCategoryChange('all');
                        setShowCategories(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 ${
                        selectedCategory === 'all' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                      }`}
                    >
                      All Products
                    </button>
                    
                    {/* Category Options */}
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          onCategoryChange(category.id);
                          setShowCategories(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 ${
                          selectedCategory === category.id ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-[10px] md:text-sm text-gray-600">
            <span className="font-semibold text-emerald-700">{filteredProducts.length}</span> items
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 md:p-6">
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4' 
          : 'space-y-2'
        }>
          {children}
        </div>
      </div>
    </div>
  );
}