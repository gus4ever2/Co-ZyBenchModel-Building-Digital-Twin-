import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../utils/components/navBar';
import Footer from '../utils/components/Footer';
import cozyLogo from '../assets/cozy-logo.png';
import service1 from '../assets/service1.png';
import service2 from '../assets/service2.png';
import service3 from '../assets/service3.png';
import teamMember1 from '../assets/teamMember1.png';
import teamMember2 from '../assets/teamMember2.png';
import linkedin from '../assets/linkedin.png';

const Home = () => {
  return (
    <div className="Home">
      <Navbar />
      <div className="mt-[96px]">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between bg-gray-50 px-6 lg:px-16 py-12">
        <div className="text-center lg:text-left mb-8 lg:mb-0">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-800">
            Charting the path to optimal comfort
          </h1>
          <h2 className="text-lg lg:text-xl font-medium text-gray-600 mb-6">
            Your online tool for benchmarking thermal comfort provision systems across smart spaces
          </h2>
          <button className="bg-gray-800 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg">
            Start your simulation
          </button>
        </div>
        <div>
          <img
            src={cozyLogo}
            alt="Cozy Logo"
            className="mt-6 lg:mt-0 w-72 lg:w-90"
          />
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-white py-12 px-6 lg:px-16" id="services">
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
            Our services
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Box 1 */}
          <div className="flex items-center justify-between bg-gray-100 p-6 rounded-lg shadow-md">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Try your customised scenario</h3>
              <p className="text-gray-600">Learn more</p>
            </div>
            <img src={service1} alt="" className="w-20 h-20" />
          </div>

          {/* Service Box 2 */}
         {/* Service Box 2 */}
          <Link
            to="/configs"
            className="flex items-center justify-between bg-green-100 p-6 rounded-lg shadow-md hover:bg-green-200 transition-colors"
          >
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Try our reference systems</h3>
              <p className="text-green-600">Learn more</p>
            </div>
            <img src={service2} alt="Service Icon" className="w-20 h-20" />
          </Link>


          {/* Service Box 3 */}
          <div className="flex items-center justify-between bg-blue-100 p-6 rounded-lg shadow-md col-span-1 lg:col-span-2">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Analytics and Tracking</h3>
              <p className="text-gray-600">Learn more</p>
            </div>
            <img src={service3} alt="" className="w-20 h-20" />
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-12 px-6 lg:px-16" id="about-us">
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
            Team
          </h1>
          <p className="text-gray-600">
            Meet the skilled and experienced team behind our successful digital marketing strategies
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Team Member 1 */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="mb-4">
              <img src={linkedin} alt="LinkedIn Icon" className="w-8 h-8 mx-auto" />
            </div>
            <img src={teamMember1} alt="John Smith" className="w-24 h-24 rounded-full mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">John Smith</h3>
            <p className="text-gray-600 mb-2">CEO and Founder</p>
            <p className="text-gray-500">
              10+ years of experience in digital marketing. Expertise in SEO, PPC, and content strategy.
            </p>
          </div>

          {/* Team Member 2 */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="mb-4">
              <img src={linkedin} alt="LinkedIn Icon" className="w-8 h-8 mx-auto" />
            </div>
            <img src={teamMember2} alt="Jane Doe" className="w-24 h-24 rounded-full mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Jane Doe</h3>
            <p className="text-gray-600 mb-2">Director of Operations</p>
            <p className="text-gray-500">
              7+ years of experience in project management and team leadership. Strong communication skills.
            </p>
          </div>
        </div>
      </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
