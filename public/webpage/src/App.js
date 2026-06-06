import React, { useState } from 'react';

/**
 * Modern Landing Page Component
 * Features:
 * - Responsive Navigation with Mobile Menu
 * - Hero Section with Gradient Text and Decorative Elements
 * - Feature Grid with SVG Icons
 * - Pricing Comparison Cards
 * - Professional Dark Footer
 */

const CheckIcon = () => (
  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="text-xl font-bold tracking-tight">ครบเครื่องเรื่องไอที</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#solutions" className="text-gray-600 hover:text-indigo-600 transition-colors">Solutions</a>
              <a href="#pricing" className="text-gray-600 hover:text-indigo-600 transition-colors">Pricing</a>
              <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-full font-medium hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md">
              เริ่มเลย
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 py-4 px-4 space-y-4">
            <a href="#features" className="block text-gray-600 hover:text-indigo-600">Features</a>
            <a href="#solutions" className="block text-gray-600 hover:text-indigo-600">Solutions</a>
            <a href="#pricing" className="block text-gray-600 hover:text-indigo-600">Pricing</a>
            <button className="w-full bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium">Get Started</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
                <span>✨ New version 2.0 is now live!</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                Scale your workflow <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                  without the stress.
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0">
                The all-in-one platform to manage your projects, collaborate with teams, and track progress in real-time. Built for the modern distributed workforce.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <button className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200">
                  Start Free Trial
                </button>
                <button className="w-full sm:w-auto bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-all">
                  Book a Demo
                </button>
              </div>
            </div>
            
            {/* Visual Placeholder Section */}
            <div className="lg:col-span-6 mt-16 lg:mt-0 relative">
              <div className="relative z-10 bg-gradient-to-tr from-indigo-100 to-violet-100 rounded-3xl p-4 shadow-2xl">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-white">
                  <div className="h-8 bg-gray-50 flex items-center px-4 space-x-1.5 border-b">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                      <div className="h-4 w-32 bg-gray-100 rounded"></div>
                      <div className="h-8 w-8 bg-indigo-50 rounded-full"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-4 w-full bg-gray-100 rounded"></div>
                      <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
                      <div className="h-4 w-4/6 bg-gray-100 rounded"></div>
                    </div>
                    <div className="mt-8 grid grid-cols-3 gap-4">
                      <div className="h-20 bg-indigo-50 rounded-xl"></div>
                      <div className="h-20 bg-indigo-50 rounded-xl"></div>
                      <div className="h-20 bg-indigo-50 rounded-xl"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-400/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-400/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need to succeed
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: 'Real-time Analytics',
                desc: 'Track every interaction and metric as it happens with our high-fidelity dashboard.',
                icon: (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              {
                title: 'Team Collaboration',
                desc: 'Work seamlessly with your team members across different timezones and departments.',
                icon: (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )
              },
              {
                title: 'Secure by Default',
                desc: 'Your data is encrypted and protected with enterprise-grade security protocols.',
                icon: (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-gray-600">Choose the plan that's right for your business.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Starter', price: '0', features: ['Up to 3 projects', 'Basic analytics', 'Community support'] },
              { name: 'Professional', price: '29', features: ['Unlimited projects', 'Advanced metrics', 'Priority email support', 'Custom integrations'], popular: true },
              { name: 'Enterprise', price: '99', features: ['Unlimited everything', 'Custom reporting', 'Dedicated manager', 'SSO & Security'] }
            ].map((plan, i) => (
              <div key={i} className={`relative p-8 rounded-2xl border ${plan.popular ? 'border-indigo-600 shadow-xl scale-105 z-10' : 'border-gray-200'}`}>
                {plan.popular && (
                  <span className="absolute top-0 right-8 -translate-y-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-extrabold">${plan.price}</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center space-x-3 text-sm text-gray-600">
                      <CheckIcon />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-lg font-bold transition-colors ${plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 text-white mb-6">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="font-bold">S</span>
                </div>
                <span className="text-xl font-bold tracking-tight">ครบเครื่องเรื่องไอที</span>
              </div>
              <p className="text-sm leading-relaxed">
                Empowering teams to build better products together. The future of workflow is here.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Product</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Company</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Legal</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-sm text-center">
            © {new Date().getFullYear()} ครบเครื่องเรื่องไอที. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
