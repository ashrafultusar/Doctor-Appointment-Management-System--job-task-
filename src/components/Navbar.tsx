"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  return (
    <nav className="relative bg-white shadow dark:bg-gray-800">
      <div className="container px-6 py-3 mx-auto md:flex">
        {/* Logo & Mobile Menu Button */}
        <div className="flex items-center justify-between">
         

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden ">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-gray-500 dark:text-gray-200 cursor-pointer hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:text-gray-600 dark:focus:text-gray-400"
              aria-label="Toggle menu"
            >
              {!isOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 8h16M4 16h16"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div
          className={`absolute inset-x-0 z-20 w-full px-6 py-4 transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 md:mt-0 md:p-0 md:top-0 md:relative md:opacity-100 md:translate-x-0 md:flex md:items-center md:justify-between ${
            isOpen ? "translate-x-0 opacity-100" : "opacity-0 -translate-x-full"
          } md:opacity-100 md:translate-x-0`}
        >
          <div className="flex flex-col px-2 -mx-4 md:flex-row md:mx-10 md:py-0">
            <Link
              href="/"
              className="px-2.5 py-2 text-gray-700 transition-colors duration-300 transform rounded-lg dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 md:mx-2"
            >
              Home
            </Link>
            <Link
              href="#"
              className="px-2.5 py-2 text-gray-700 transition-colors duration-300 transform rounded-lg dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 md:mx-2"
            >
              About
            </Link>
            <Link
              href="#"
              className="px-2.5 py-2 text-gray-700 transition-colors duration-300 transform rounded-lg dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 md:mx-2"
            >
              Contact
            </Link>
          </div>

          {/* Search Input */}
          <div className="mt-4 md:mt-0 space-x-3">
            <Link
              href={"/login"}
              className="border px-4 rounded hover:bg-gray-500 cursor-pointer"
            >
              {" "}
              Login
            </Link>
            <Link
              href={"/login"}
              className="border px-4 rounded hover:bg-gray-500 cursor-pointer"
              onClick={handleLogout} >
              {" "}
             Logout
            </Link>{" "}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
