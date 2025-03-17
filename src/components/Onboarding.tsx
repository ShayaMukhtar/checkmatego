import React from 'react';
import { useNavigate } from 'react-router-dom'; // or next/router if using Next.js

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    // Redirect to your existing login/sign-up page
    navigate('/login'); 
    // or navigate('/auth') or whichever route you use
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gray-100 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to MyApp</h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Brief description of your app and the value it provides.
        </p>
        <button
          onClick={handleSignUpClick}
          className="mt-6 px-6 py-3 bg-primary text-white rounded-md"
        >
          Sign Up For Free
        </button>
      </section>

      {/* Features Section */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-6 border rounded-md bg-white shadow-sm">
            <h3 className="text-xl font-medium mb-2">Feature 1</h3>
            <p className="text-gray-600">
              Short description of Feature 1.
            </p>
          </div>
          {/* Feature 2 */}
          <div className="p-6 border rounded-md bg-white shadow-sm">
            <h3 className="text-xl font-medium mb-2">Feature 2</h3>
            <p className="text-gray-600">
              Short description of Feature 2.
            </p>
          </div>
          {/* Feature 3 */}
          <div className="p-6 border rounded-md bg-white shadow-sm">
            <h3 className="text-xl font-medium mb-2">Feature 3</h3>
            <p className="text-gray-600">
              Short description of Feature 3.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6">Pricing</h2>
          <p className="text-gray-600 mb-8">
            Describe your pricing tiers or plans.
          </p>
          {/* Example Pricing Table */}
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="w-full md:w-1/3 p-6 border rounded-md bg-white shadow-sm">
              <h3 className="text-xl font-medium mb-2">Free Plan</h3>
              <p className="text-2xl font-bold mb-4">$0</p>
              <ul className="text-gray-600 mb-6 space-y-2">
                <li>Basic features</li>
                <li>Community support</li>
              </ul>
              <button
                onClick={handleSignUpClick}
                className="px-6 py-3 bg-primary text-white rounded-md"
              >
                Sign Up
              </button>
            </div>
            {/* More plans if needed */}
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-20 bg-primary text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="mb-6">Sign up today for free!</p>
        <button
          onClick={handleSignUpClick}
          className="px-6 py-3 bg-white text-primary rounded-md font-medium"
        >
          Get Started
        </button>
      </section>
    </div>
  );
};

export default Onboarding;
