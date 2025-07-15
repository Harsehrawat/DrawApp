"use client";

import React, { useState } from 'react';
import { 
  Palette, 
  Users, 
  Zap, 
  Shield, 
  Download, 
  Star,
  Check,
  Menu,
  X,
  ArrowRight,
  Play,
  Globe,
  Smartphone,
  Layers
} from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md fixed w-full top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">DrawBoard</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">Features</a>
            <a href="#demo" className="text-gray-600 hover:text-purple-600 transition-colors">Demo</a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-600 hover:text-purple-600 transition-colors">Sign In</button>
            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Get Started
            </button>
          </div>

          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">Features</a>
              <a href="#demo" className="text-gray-600 hover:text-purple-600 transition-colors">Demo</a>
              <a href="#pricing" className="text-gray-600 hover:text-purple-600 transition-colors">Pricing</a>
              <a href="#contact" className="text-gray-600 hover:text-purple-600 transition-colors">Contact</a>
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors w-full">
                Get Started
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

const Hero = () => {
  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-purple-50 via-white to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Sketch, Create, and
            <span className="text-purple-600"> Collaborate</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The ultimate virtual whiteboard for sketching hand-drawn diagrams. Perfect for brainstorming, 
            wireframing, and bringing your ideas to life with your team.
          </p>
          {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center">
              Start Drawing Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </button>
          </div> */}
        </div>

        <div className="mt-16 relative">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 max-w-4xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-purple-100 to-teal-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600 text-lg">Interactive Drawing Canvas</p>
                <p className="text-sm text-gray-500 mt-2">Easy to Draw, Easier to Collaborate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Hand-drawn Feel",
      description: "Create beautiful diagrams with a natural, hand-drawn aesthetic that feels authentic and engaging."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Real-time Collaboration",
      description: "Work together with your team in real-time. See changes instantly and collaborate seamlessly."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Optimized for speed and performance. No lag, no delays - just smooth drawing experience."
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need to create
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful features designed to help you visualize ideas, collaborate with teams, and create stunning diagrams.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group p-6 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Demo = () => {
  return (
    <section id="demo" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            See it in action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch how easy it is to create beautiful diagrams and collaborate with your team.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="aspect-video bg-gradient-to-br from-teal-100 to-purple-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600 text-lg">Interactive Drawing Canvas</p>
                <p className="text-sm text-gray-500 mt-2">Easy to Draw, Easier to Collaborate</p>
              </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-purple-600 rounded-full p-2 mt-1">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Works everywhere</h3>
                <p className="text-gray-600">Access your drawings from any device, anywhere in the world.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-teal-600 rounded-full p-2 mt-1">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Mobile optimized</h3>
                <p className="text-gray-600">Touch-friendly interface that works perfectly on tablets and phones.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-orange-600 rounded-full p-2 mt-1">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Team collaboration</h3>
                <p className="text-gray-600">Invite team members and work together in real-time.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Logo + Description */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">DrawBoard</span>
          </div>
          <p className="text-gray-400 max-w-md">
            The ultimate virtual whiteboard for sketching and collaboration.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2025 DrawBoard. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Demo/>
      <Features />
      <Footer />
    </div>
  );
}

export default App;