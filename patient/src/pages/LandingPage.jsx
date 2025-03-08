import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Stethoscope,
  Database,
  LineChart,
  Clock,
  Search,
  FileText,
  CheckCircle,
  ArrowRight,
  Mail,
  Github,
  Twitter,
  Linkedin,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import CountUp from "react-countup";
import { SignInButton } from "@clerk/clerk-react";

function LandingPage() {
  // Initialize darkMode state with localStorage or system preference
  const [darkMode, setDarkMode] = useState(() => {
    // First check localStorage
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      return JSON.parse(savedMode);
    }
    // If no preference is saved, use system preference
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      // Only change theme automatically if user hasn't set a preference
      if (localStorage.getItem("darkMode") === null) {
        setDarkMode(e.matches);
      }
    };

    // Add event listener
    mediaQuery.addEventListener("change", handleChange);

    // Clean up listener on unmount
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Apply dark mode class and save preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Save preference to localStorage
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Toggle dark mode function
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      {/* Navigation */}
      <motion.nav
        className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors duration-200"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">
                Sevaमित्र
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Pricing
              </a>
              <SignInButton
                href="#"
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Login
              </SignInButton>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="md:hidden flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-white dark:bg-gray-900 shadow-lg py-4 px-4 transition-all duration-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col space-y-4">
              <a
                href="#features"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#"
                className="bg-blue-600 text-white hover:bg-blue-700 transition-colors py-2 px-4 rounded-md text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </a>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        className="relative py-20 px-4 sm:px-6 lg:px-8 min-h-[80vh] flex items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fHBhdGllbnQlMkJkb2N0b3IlMkJ0ZWNobm9sb2d5fGVufDB8fDB8fHww"
            alt="Background"
            className="w-full h-full object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/60 to-gray-900/50"></div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="text-center">
            <motion.div
              className="inline-block px-3 py-1 rounded-full bg-blue-100/10 text-blue-300 text-sm font-medium mb-4"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              AI-Powered Healthcare
            </motion.div>
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4"
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Enhancing Clinical Decision
              <span className="text-blue-400"> Support Systems</span>
            </motion.h1>
            <motion.h2
              className="mt-2 text-xl sm:text-2xl md:text-3xl font-semibold text-blue-300"
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5 }}
            >
              with Retrieval-Augmented Generation
            </motion.h2>
            <motion.p
              className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Empowering healthcare professionals with AI-driven insights that
              combine the latest medical knowledge with patient-specific data
              for more accurate diagnoses and treatment plans.
            </motion.p>
            <motion.div
              className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <a
                href="#contact"
                className="px-8 py-3 sm:py-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                Request a Demo
              </a>
              <a
                href="#how-it-works"
                className="px-8 py-3 sm:py-4 rounded-lg border border-blue-400/30 text-blue-300 font-medium hover:bg-blue-900/30 transition-colors w-full sm:w-auto"
              >
                Learn More
              </a>
            </motion.div>
          </div>

          {/* Stats Section - Mobile & Desktop Versions */}
          <div className="py-8 sm:py-12 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-2 sm:px-4">
              {/* Mobile Stats (2x2 grid) */}
              <div className="grid grid-cols-2 gap-4 lg:hidden">
                {/* Accuracy Rate */}
                <div className="text-center">
                  <div className="bg-blue-100/10 backdrop-blur-sm rounded-lg p-4 transform transition">
                    <div className="flex items-center justify-center">
                      <CountUp
                        end={98}
                        suffix="%"
                        duration={2.5}
                        className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
                        enableScrollSpy={true}
                        scrollSpyDelay={200}
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-300">Accuracy Rate</p>
                  </div>
                </div>

                {/* Medical Institutions */}
                <div className="text-center">
                  <div className="bg-blue-100/10 backdrop-blur-sm rounded-lg p-4 transform transition">
                    <div className="flex items-center justify-center">
                      <CountUp
                        end={500}
                        suffix="+"
                        duration={2.5}
                        className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
                        enableScrollSpy={true}
                        scrollSpyDelay={200}
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-300">
                      Medical Institutions
                    </p>
                  </div>
                </div>

                {/* Patient Records */}
                <div className="text-center">
                  <div className="bg-blue-100/10 backdrop-blur-sm rounded-lg p-4 transform transition">
                    <div className="flex items-center justify-center">
                      <CountUp
                        end={30}
                        suffix="M+"
                        duration={2.5}
                        className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
                        enableScrollSpy={true}
                        scrollSpyDelay={200}
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-300">
                      Patient Records
                    </p>
                  </div>
                </div>

                {/* Time Saved */}
                <div className="text-center">
                  <div className="bg-blue-100/10 backdrop-blur-sm rounded-lg p-4 transform transition">
                    <div className="flex items-center justify-center">
                      <CountUp
                        end={45}
                        suffix="%"
                        duration={2.5}
                        className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
                        enableScrollSpy={true}
                        scrollSpyDelay={200}
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-300">Time Saved</p>
                  </div>
                </div>
              </div>

              {/* Desktop Stats (row) - Keep your existing desktop version */}
              <div className="hidden lg:grid lg:grid-cols-4 lg:gap-8">
                {/* Accuracy Rate */}
                <div className="text-center group">
                  <div className="bg-blue-100/10 backdrop-blur-sm rounded-xl p-6 transform transition-all duration-300 group-hover:scale-105">
                    <div className="flex items-center justify-center">
                      <CountUp
                        end={98}
                        suffix="%"
                        duration={2.5}
                        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
                        enableScrollSpy={true}
                        scrollSpyDelay={200}
                      />
                    </div>
                    <p className="mt-2 text-gray-300">Accuracy Rate</p>
                  </div>
                </div>

                {/* Medical Institutions */}
                <div className="text-center group">
                  <div className="bg-blue-100/10 backdrop-blur-sm rounded-xl p-6 transform transition-all duration-300 group-hover:scale-105">
                    <div className="flex items-center justify-center">
                      <CountUp
                        end={500}
                        suffix="+"
                        duration={2.5}
                        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
                        enableScrollSpy={true}
                        scrollSpyDelay={200}
                      />
                    </div>
                    <p className="mt-2 text-gray-300">Medical Institutions</p>
                  </div>
                </div>

                {/* Patient Records */}
                <div className="text-center group">
                  <div className="bg-blue-100/10 backdrop-blur-sm rounded-xl p-6 transform transition-all duration-300 group-hover:scale-105">
                    <div className="flex items-center justify-center">
                      <CountUp
                        end={30}
                        suffix="M+"
                        duration={2.5}
                        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
                        enableScrollSpy={true}
                        scrollSpyDelay={200}
                      />
                    </div>
                    <p className="mt-2 text-gray-300">Patient Records</p>
                  </div>
                </div>

                {/* Time Saved */}
                <div className="text-center group">
                  <div className="bg-blue-100/10 backdrop-blur-sm rounded-xl p-6 transform transition-all duration-300 group-hover:scale-105">
                    <div className="flex items-center justify-center">
                      <CountUp
                        end={45}
                        suffix="%"
                        duration={2.5}
                        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
                        enableScrollSpy={true}
                        scrollSpyDelay={200}
                      />
                    </div>
                    <p className="mt-2 text-gray-300">Time Saved</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section
        id="features"
        className="py-16 bg-white dark:bg-gray-900 transition-colors duration-200 "
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm font-medium mb-4">
              Features
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Patient-Centric Features
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Empowering patients with secure, intelligent healthcare solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Document Management
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Securely store and organize all your medical documents in one
                place for easy access and sharing with healthcare providers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Secure Access Control
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Control who accesses your medical information with OTP-based
                authentication, ensuring your data remains private and secure.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                AI-Powered Insights
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Receive personalized health insights and recommendations based
                on your medical history and current conditions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Quick Consultations
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get faster medical consultations by providing doctors with
                organized, AI-analyzed medical history and symptoms.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Medical History Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Maintain a comprehensive digital record of your medical history,
                treatments, and medications in one secure platform.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <LineChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Progress Monitoring
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track your health progress over time with easy-to-understand
                visualizations and regular health status updates.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm font-medium mb-4">
              Process
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              How It Works
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Three simple steps to get your medical consultation
            </p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-blue-200 dark:bg-blue-800 -translate-y-1/2 z-0"></div>

            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-md text-center border border-gray-100 dark:border-gray-700">
                <div className="bg-blue-600 dark:bg-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  1. Share Documents
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Upload all your medical documents and reports to a Google
                  Drive folder and share the access link with us for
                  comprehensive analysis.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-md text-center border border-gray-100 dark:border-gray-700">
                <div className="bg-blue-600 dark:bg-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <div className="text-white text-2xl font-bold">OTP</div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  2. Secure Access
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Receive a unique OTP that you'll share with your doctor,
                  ensuring secure and authorized access to your medical
                  information.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-md text-center border border-gray-100 dark:border-gray-700">
                <div className="bg-blue-600 dark:bg-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  3. Get Consultation
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  After document review, receive personalized medical
                  suggestions and treatment recommendations from healthcare
                  professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      {/* <section
        id="pricing"
        className="py-16 bg-white dark:bg-gray-900 transition-colors duration-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm font-medium mb-4">
              Pricing
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose the plan that fits your institution's needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 flex flex-col">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Starter
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  $499
                </span>
                <span className="text-gray-600 dark:text-gray-300">/month</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Perfect for small clinics and individual practitioners.
              </p>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  Up to 5 users
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  Basic knowledge base
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  Standard support
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  100 queries per day
                </li>
              </ul>
              <a
                href="#contact"
                className="mt-auto px-6 py-3 rounded-lg border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-center"
              >
                Get Started
              </a>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg border-2 border-blue-600 dark:border-blue-500 flex flex-col relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Professional
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  $1,299
                </span>
                <span className="text-gray-600 dark:text-gray-300">/month</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Ideal for mid-sized medical practices and departments.
              </p>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  Up to 25 users
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  Advanced knowledge base
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  Priority support
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  Unlimited queries
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  Custom integrations
                </li>
              </ul>
              <a
                href="#contact"
                className="mt-auto px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-center"
              >
                Get Started
              </a>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 flex flex-col">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Enterprise
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  Custom
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                For large hospitals and healthcare networks.
              </p>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  Unlimited users
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  Comprehensive knowledge base
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  24/7 dedicated support
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  Unlimited queries
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  Custom development
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  On-premise deployment option
                </li>
              </ul>
              <a
                href="#contact"
                className="mt-auto px-6 py-3 rounded-lg border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-center"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section
        id="contact"
        className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 transition-colors duration-200"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-500/30 text-white text-sm font-medium mb-4">
            Get Started
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Clinical Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join leading healthcare institutions already benefiting from our
            RAG-powered clinical decision support system.
          </p>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg max-w-2xl mx-auto border border-gray-100 dark:border-gray-700">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Request a Demo
            </h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Dr. Jane Smith"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="jane.smith@hospital.org"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="institution"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Institution
                </label>
                <input
                  type="text"
                  id="institution"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="General Hospital"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Tell us about your specific needs..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
              >
                Submit Request <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <Stethoscope className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-semibold">Sevaमित्र</span>
              </div>
              <p className="mt-4 text-gray-400">
                Enhancing clinical decision support with advanced AI and
                retrieval-augmented generation.
              </p>
              <div className="mt-6 flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Case Studies
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Research
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Webinars
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} MediRAG. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
