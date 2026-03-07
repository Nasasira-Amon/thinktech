// Import Link component for client-side navigation without page reload
import { Link } from 'react-router-dom';

// Import icon components from lucide-react for visual elements
import { ShieldCheck, Users, BookOpen, GraduationCap, Rocket, Network } from 'lucide-react';

// Landing page component - first page visitors see when they arrive at the site
// Showcases the platform's value proposition and guides users to sign up
export function Landing() {
  return (
    // Main container with black background spanning full viewport height
    <div className="min-h-screen bg-black text-white">
      {/* Navigation bar - fixed at top for easy access throughout landing page */}
      <nav className="border-b border-gray-800">
        {/* Container with max width and horizontal padding for content alignment */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Flexbox row with space between logo and CTA buttons */}
          <div className="flex justify-between items-center h-16">
            {/* Brand logo/name on the left side */}
            <div className="flex items-center">
              {/* Link to home page (current page) */}
              <Link to="/" className="text-2xl font-bold">
                {/* Brand name with green accent on "ID" for visual interest */}
                VersePass ID <span className="text-green-500">Africa</span>
              </Link>
            </div>

            {/* Call-to-action buttons on the right side */}
            <div className="flex gap-4">
              {/* Login button with subtle border and hover effect */}
              <Link
                to="/login"
                className="px-4 py-2 border border-gray-700 rounded-lg hover:border-green-500 transition-colors"
              >
                Sign In
              </Link>

              {/* Primary signup button with green background (brand color) */}
              <Link
                to="/signup"
                className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero section - main attention-grabbing area with headline and CTA */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black to-green-800/10 z-0">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-600 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Centered content container with max width */}
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Main headline - largest text explaining core value proposition */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Your Verified Student
            {/* "Innovation Passport" in green for emphasis */}
            <span className="text-green-500"> Innovation Passport</span>
          </h1>

          {/* Supporting subheadline explaining platform purpose */}
          <p className="text-xl text-gray-400 mb-8">
            Connect with verified university students across East Africa. Build startup teams,
            match skills, and collaborate on academic excellence.
          </p>

          {/* Visual icon representation */}
          <div className="mb-12 flex justify-center gap-6">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
              <GraduationCap className="w-8 h-8 text-green-500" />
            </div>
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
              <Rocket className="w-8 h-8 text-green-500" />
            </div>
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
              <Network className="w-8 h-8 text-green-500" />
            </div>
          </div>

          {/* Call-to-action buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            {/* Primary CTA - Get Started button */}
            <Link
              to="/signup"
              className="px-8 py-3 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium text-lg"
            >
              Get Started
            </Link>

            {/* Secondary CTA - Explore without signup */}
            <Link
              to="/login"
              className="px-8 py-3 border border-gray-700 rounded-lg hover:border-green-500 transition-colors text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features section - highlights the three core platform capabilities */}
      <section className="py-20 px-4 bg-gray-900">
        {/* Container with max width for content */}
        <div className="max-w-7xl mx-auto">
          {/* Section heading */}
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose VersePass ID Africa?
          </h2>

          {/* Three-column grid for feature cards (responsive: 1 col mobile, 3 cols desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1: Verified Digital ID */}
            <div className="bg-black border border-gray-800 rounded-lg overflow-hidden hover:border-green-500 transition-all p-6">
              {/* Icon container with green background */}
              <div className="w-16 h-16 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                {/* Shield icon representing security and verification */}
                <ShieldCheck className="w-8 h-8 text-green-500" />
              </div>
              {/* Feature title */}
              <h3 className="text-xl font-bold mb-2 text-center">Verified Student Digital ID</h3>
              {/* Feature description */}
              <p className="text-gray-400 text-center">
                Build trust with university-verified profiles. Your academic credentials matter.
              </p>
            </div>

            {/* Feature Card 2: Skill Matching */}
            <div className="bg-black border border-gray-800 rounded-lg overflow-hidden hover:border-green-500 transition-all p-6">
              {/* Icon container with green background */}
              <div className="w-16 h-16 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                {/* Users icon representing team formation */}
                <Users className="w-8 h-8 text-green-500" />
              </div>
              {/* Feature title */}
              <h3 className="text-xl font-bold mb-2 text-center">Skill Matching for Startup Teams</h3>
              {/* Feature description */}
              <p className="text-gray-400 text-center">
                Find co-founders and teammates based on complementary skills and shared vision.
              </p>
            </div>

            {/* Feature Card 3: Academic Collaboration */}
            <div className="bg-black border border-gray-800 rounded-lg overflow-hidden hover:border-green-500 transition-all p-6">
              {/* Icon container with green background */}
              <div className="w-16 h-16 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                {/* Book icon representing education and learning */}
                <BookOpen className="w-8 h-8 text-green-500" />
              </div>
              {/* Feature title */}
              <h3 className="text-xl font-bold mb-2 text-center">Cross-University Collaboration</h3>
              {/* Feature description */}
              <p className="text-gray-400 text-center">
                Compare course outlines, share resources, and learn from peers across institutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works section - step-by-step process explanation */}
      <section className="py-20 px-4">
        {/* Container with max width */}
        <div className="max-w-4xl mx-auto">
          {/* Section heading */}
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          {/* Vertical stack of steps with spacing between each */}
          <div className="space-y-8">
            {/* Step 1: Verification */}
            <div className="flex gap-4">
              {/* Step number badge with green background */}
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">
                1
              </div>
              {/* Step content */}
              <div>
                {/* Step title */}
                <h3 className="text-xl font-bold mb-2">Verify Your Student Status</h3>
                {/* Step description */}
                <p className="text-gray-400">
                  Sign up with your university email and student credentials for verification.
                </p>
              </div>
            </div>

            {/* Step 2: Profile Building */}
            <div className="flex gap-4">
              {/* Step number badge */}
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">
                2
              </div>
              {/* Step content */}
              <div>
                {/* Step title */}
                <h3 className="text-xl font-bold mb-2">Build Your Skill Profile</h3>
                {/* Step description */}
                <p className="text-gray-400">
                  Add your skills, interests, passion fields, and portfolio to showcase your abilities.
                </p>
              </div>
            </div>

            {/* Step 3: Discovery */}
            <div className="flex gap-4">
              {/* Step number badge */}
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">
                3
              </div>
              {/* Step content */}
              <div>
                {/* Step title */}
                <h3 className="text-xl font-bold mb-2">Match and Connect</h3>
                {/* Step description */}
                <p className="text-gray-400">
                  Discover students with complementary skills and send connection requests.
                </p>
              </div>
            </div>

            {/* Step 4: Collaboration */}
            <div className="flex gap-4">
              {/* Step number badge */}
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">
                4
              </div>
              {/* Step content */}
              <div>
                {/* Step title */}
                <h3 className="text-xl font-bold mb-2">Build Teams & Share Learning</h3>
                {/* Step description */}
                <p className="text-gray-400">
                  Form startup teams, collaborate on projects, and exchange academic resources.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final call-to-action section before footer */}
      <section className="py-20 px-4 bg-gray-900">
        {/* Centered content container */}
        <div className="max-w-4xl mx-auto text-center">
          {/* Heading encouraging action */}
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          {/* Supporting text */}
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of verified students building the future of East Africa.
          </p>
          {/* Primary CTA button */}
          <Link
            to="/signup"
            className="inline-block px-8 py-3 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium text-lg"
          >
            Create Your Digital ID
          </Link>
        </div>
      </section>

      {/* Footer section with copyright and links */}
      <footer className="border-t border-gray-800 py-8 px-4">
        {/* Centered container */}
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          {/* Copyright notice */}
          <p>&copy; 2024 VersePass ID Africa. Empowering student innovation across East Africa.</p>
        </div>
      </footer>
    </div>
  );
}
