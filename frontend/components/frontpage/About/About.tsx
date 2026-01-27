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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8">
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
          
          <h2 className="text-xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
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
              
              <h3 className="text-3xl md:text-3xl font-bold text-gray-900 mb-6">
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

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-1 bg-gradient-to-r from-[#0091AD] to-[#00b8d4]"></div>
              <span className="text-sm font-semibold uppercase tracking-wider text-[#0091AD]">Our Impact</span>
              <div className="w-10 h-1 bg-gradient-to-r from-[#0091AD] to-[#00b8d4]"></div>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
              Making a Difference in Kenyan Homes
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-b from-white to-[#f8fdff] rounded-xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#e6f7fb] to-[#d1f2f7] flex items-center justify-center mb-4">
                    <Icon size={28} className="text-[#0091AD]" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{achievement.number}</div>
                  <div className="text-sm text-gray-600 font-medium">{achievement.label}</div>
                </motion.div>
              );
            })}
          </div>
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