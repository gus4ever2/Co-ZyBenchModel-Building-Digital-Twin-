import React from 'react';
import icon1 from './../../assets/icon1.png';
import icon2 from './../../assets/icon2.png';
import icon3 from './../../assets/icon3.png';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start">
          {/* Social Links */}
          <div className="flex space-x-4 mb-6 lg:mb-0">
            <a href="#" className="hover:opacity-75 transition">
              <img src={icon1} alt="LinkedIn" className="w-8 h-8" />
            </a>
            <a href="#" className="hover:opacity-75 transition">
              <img src={icon2} alt="Facebook" className="w-8 h-8" />
            </a>
            <a href="#" className="hover:opacity-75 transition">
              <img src={icon3} alt="Twitter" className="w-8 h-8" />
            </a>
          </div>

          {/* Contact Info */}
          <div className="text-center lg:text-left">
            <h3 className="text-lg font-semibold mb-2">Contact us:</h3>
            <p>Email: <a href="mailto:info@positivus.com" className="hover:underline">info@cozybench.com</a></p>
            <p>Phone: 555-567-8901</p>
            <p>Address: 1234 Main St, Moonstone City, Stardust State 12345</p>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-8 border-gray-700" />

        {/* Footer Bottom */}
        <div className="flex flex-col lg:flex-row justify-between items-center text-sm">
          <p>© 2024 CozyBench. All Rights Reserved.</p>
          <p>
            <a href="#" className="hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
