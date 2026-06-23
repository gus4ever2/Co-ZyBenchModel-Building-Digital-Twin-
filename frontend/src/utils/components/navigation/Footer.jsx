import React from 'react';
import { Github, Twitter, Mail, Box } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <Box className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-lg font-semibold">CozyBench</span>
            </div>
            <p className="text-gray-600 text-sm">
              Advanced benchmarking for thermal comfort systems in smart spaces.
            </p>
            <p className="text-gray-600 text-sm">
                Developed by{" "}
                <a
                  href="https://www.linkedin.com/in/aziz-boubaker-687277209/" // Remplace par l'URL correcte
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Aziz Boubaker
                </a>{" "}
                and{" "}
                <a
                  href="https://www.linkedin.com/in/sabrine-azaiez-/" // Remplace par l'URL correcte
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Sabrine Azaiez
                </a>
              </p>

            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Features</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Documentation</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">API Reference</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Getting Started</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Tutorials</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Case Studies</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Blog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gray-900">About</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Contact</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} CozyBench. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}