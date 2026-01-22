'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Leaf, Smile } from 'lucide-react';

export const About: React.FC = () => {
  const values = [
    {
      icon: Heart,
      title: 'Quality Care',
      description: 'Premium products designed with your wellness in mind',
    },
    {
      icon: Leaf,
      title: 'Natural Ingredients',
      description: 'Eco-friendly and sustainable sanitary solutions',
    },
    {
      icon: Smile,
      title: 'Customer Wellness',
      description: 'Dedicated to empowering women\'s health and comfort',
    },
  ];

  return (
    <section id="about" className="py-20" >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About <span style={{ color: '#0091AD' }}>Mams Entreprise</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Committed to bringing premium sanitary care to every woman
          </p>
        </motion.div>

        {/* Main Story */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          {/* Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Mams Enterprise is dedicated to providing premium sanitary and wellness products that empower women to feel confident and comfortable every day. Based in DCI Juja, we believe that quality care shouldn&apos;t be a luxury.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Our carefully curated collection of products is sourced from trusted suppliers who share our commitment to quality, safety, and sustainability. Every product undergoes rigorous testing to ensure it meets the highest standards.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We&apos;re more than just a store—we&apos;re a wellness partner committed to your health and happiness.
            </p>
          </motion.div>

          {/* Right Side - Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex items-center justify-center"
          >
            <div className="w-full h-96 rounded-2xl shadow-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5fb3cc 0%, #0091AD 100%)' }}>
              <span className="text-white text-6xl font-bold">ME</span>
            </div>
          </motion.div>
        </div>

        {/* Mission, Vision, Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#e6f7fb' }}>
              <span style={{ color: '#0091AD' }} className="font-bold text-xl">M</span>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h4>
            <p className="text-gray-600 leading-relaxed">
              To revolutionize women&apos;s wellness by providing accessible, high-quality sanitary products that prioritize comfort, health, and environmental responsibility.
            </p>
          </motion.div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#e6f7fb' }}>
              <span style={{ color: '#0091AD' }} className="font-bold text-xl">V</span>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h4>
            <p className="text-gray-600 leading-relaxed">
              To be East Africa&apos;s most trusted brand in women&apos;s wellness, known for innovation, quality, and a genuine commitment to every customer&apos;s health journey.
            </p>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#e6f7fb' }}>
              <span style={{ color: '#0091AD' }} className="font-bold text-xl">V</span>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h4>
            <p className="text-gray-600 leading-relaxed">
              Quality, Integrity, Sustainability, and Customer-Centric approach guide every decision we make in serving our community.
            </p>
          </motion.div>
        </div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose Mams Enterprise?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #5fb3cc 0%, #0091AD 100%)' }}>
                    <Icon size={32} color="white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h4>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
