'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Shield, Truck, Users, Award, Target, Eye, Star, ThumbsUp } from 'lucide-react';

export const About: React.FC = () => {
  const values = [
    {
      icon: Shield,
      title: 'Quality Guaranteed',
      description: 'Every product meets the highest standards of quality and safety',
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Same-day delivery available in Juja and surrounding areas',
    },
    {
      icon: Users,
      title: 'Community Focused',
      description: 'Supporting local communities with affordable solutions',
    },
  ];

  const achievements = [
    { number: '5+', label: 'Years Serving Kenya', icon: Target },
    { number: '50+', label: 'Premium Products', icon: Star },
    { number: '1000+', label: 'Happy Families', icon: ThumbsUp },
    { number: '24/7', label: 'Customer Support', icon: CheckCircle },
  ];

  return (
    <section id="about" className="relative min-h-screen overflow-hidden pb-20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f8fdff] to-[#e6f7fb]"></div>
      
      {/* Floating elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-20 left-10 w-40 h-40 rounded-full opacity-5 blur-3xl" 
        style={{ background: 'linear-gradient(135deg, #5fb3cc 0%, #0091AD 100%)' }}
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute bottom-20 right-10 w-60 h-60 rounded-full opacity-5 blur-3xl"
        style={{ background: 'linear-gradient(135deg, #5fb3cc 0%, #0091AD 100%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-12">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#e6f7fb] to-[#d1f2f7] px-4 py-2 rounded-full mb-6">
            <CheckCircle size={20} className="text-[#0091AD]" />
            <span className="text-sm font-semibold text-[#0091AD]">Trusted Since 2020</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            More Than Just A Store
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#0091AD] to-[#00b8d4]">
              Your Wellness Partner
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            MAM&apos;s Enterprise is your trusted source for premium hygiene products, 
            combining quality, affordability, and exceptional service since our founding.
          </p>
        </motion.div>

        {/* Achievement Stats - Added back */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e6f7fb] to-[#d1f2f7] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon size={24} className="text-[#0091AD]" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{achievement.number}</div>
                    <div className="text-sm text-gray-600">{achievement.label}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left Column - Our Story */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-10 h-1 bg-gradient-to-r from-[#0091AD] to-[#00b8d4]"></div>
                <span className="text-sm font-semibold uppercase tracking-wider text-[#0091AD]">Our Journey</span>
              </div>
              
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Building Trust Through Quality & Service
              </h3>
              
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  Founded in 2020 in DCI Juja, <span className="font-semibold text-gray-900">MAM&apos;s Enterprise</span> began with a simple mission: to provide families with access to premium hygiene products at affordable prices.
                </p>
                
                <div className="bg-gradient-to-r from-[#f8fdff] to-transparent p-6 rounded-xl border-l-4 border-[#0091AD]">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-[#0091AD] mt-1 flex-shrink-0" />
                    <p className="text-gray-600">
                      We specialize in <span className="font-semibold text-gray-900">baby diapers, adult diapers, and tissue products</span>, serving households, institutions, and bulk buyers across Kenya with reliable solutions.
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-600 leading-relaxed">
                  What started as a small retail operation has grown into a trusted enterprise, known for our commitment to quality, customer satisfaction, and community impact.
                </p>
              </div>
            </div>

            {/* Mission & Vision Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-white to-[#f8fdff] rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#e6f7fb] to-[#d1f2f7] flex items-center justify-center mb-4">
                  <Target size={24} className="text-[#0091AD]" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h4>
                <p className="text-gray-600 text-sm">
                  To improve everyday hygiene and comfort by making trusted diapers and tissue brands easily accessible and affordable.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-white to-[#f8fdff] rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#e6f7fb] to-[#d1f2f7] flex items-center justify-center mb-4">
                  <Eye size={24} className="text-[#0091AD]" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h4>
                <p className="text-gray-600 text-sm">
                  To become Kenya&apos;s most trusted hygiene products provider, transforming lives through quality and accessibility.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Image & Values */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Brand Logo Display */}
            <div className="relative group">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <div 
                  className="w-full h-64 md:h-80 rounded-2xl flex items-center justify-center relative"
                  style={{ 
                    background: 'linear-gradient(135deg, #5fb3cc 0%, #0091AD 50%, #00b8d4 100%)',
                    backgroundSize: '400% 400%',
                  }}
                >
                  <div className="relative z-10 text-center p-8">
                    <div className="text-7xl md:text-8xl font-bold text-white mb-4 tracking-tighter">ME</div>
                    <div className="text-white/90 text-xl font-semibold tracking-wide">MAM&apos;s ENTERPRISE</div>
                    <div className="text-white/70 mt-2 text-sm">Since 2020</div>
                  </div>
                  
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    animation: 'shimmer 3s infinite'
                  }} />
                </div>
              </div>
            </div>

            {/* Our Values */}
            <div>
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="w-10 h-1 bg-gradient-to-r from-[#0091AD] to-[#00b8d4]"></div>
                <span className="text-sm font-semibold uppercase tracking-wider text-[#0091AD]">Our Values</span>
              </div>
              
              <div className="space-y-4">
                {values.map((value, index) => {
                  const Icon = value.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white hover:bg-gradient-to-r hover:from-white hover:to-[#f8fdff] transition-all group cursor-pointer border border-gray-100"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e6f7fb] to-[#d1f2f7] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon size={24} className="text-[#0091AD]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">{value.title}</h4>
                        <p className="text-sm text-gray-600">{value.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Commitment Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden mb-16"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0091AD] via-[#00b8d4] to-[#5fb3cc] opacity-90"></div>
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`
          }} />
          
          <div className="relative z-10 p-8 md:p-12 text-center text-white">
            <Award size={48} className="mx-auto mb-6 opacity-90" />
            <h3 className="text-3xl md:text-4xl font-bold mb-6">Our Commitment to You</h3>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-95 leading-relaxed">
              &ldquo;We&apos;re dedicated to providing more than just products—we deliver peace of mind, 
              comfort, and reliability for every family we serve. Your trust is our greatest achievement.&rdquo;
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="w-8 h-0.5 bg-white/50"></div>
              <span className="font-semibold">Trust • Quality • Community • Excellence</span>
              <div className="w-8 h-0.5 bg-white/50"></div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section - Added back */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center pb-12"
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Experience Premium Hygiene Products?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust MAM&apos;s Enterprise for their family&apos;s hygiene needs.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const products = document.getElementById('products');
              if (products) products.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 bg-gradient-to-r from-[#0091AD] to-[#00b8d4] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-lg"
          >
            Shop Our Products
          </motion.button>
        </motion.div>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
};