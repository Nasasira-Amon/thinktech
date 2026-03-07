import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ProfileImageUpload from '../components/ProfileImageUpload';
import { HomeButton } from '../components/HomeButton';

export function ProfileSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [imageType, setImageType] = useState<'upload' | 'avatar'>('avatar');

  const [formData, setFormData] = useState({
    bio: '',
    passionField: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    behanceUrl: '',
    skills: '',
    interests: '',
    isOpenToStartups: false,
  });

  useEffect(() => {
    // No need to fetch universities anymore
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) {
        alert('Profile not found. Please contact support.');
        return;
      }

      await supabase
        .from('student_profiles')
        .update({
          bio: formData.bio || null,
          passion_field: formData.passionField || null,
          github_url: formData.githubUrl || null,
          linkedin_url: formData.linkedinUrl || null,
          portfolio_url: formData.portfolioUrl || null,
          behance_url: formData.behanceUrl || null,
          is_open_to_startups: formData.isOpenToStartups,
          profile_image_url: profileImageUrl || null,
          image_type: imageType,
        })
        .eq('id', profile.id);

      if (formData.skills) {
        const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
        for (const skillName of skillsArray) {
          await supabase.from('skills').insert({
            profile_id: profile.id,
            skill_name: skillName,
          });
        }
      }

      if (formData.interests) {
        const interestsArray = formData.interests.split(',').map(i => i.trim()).filter(Boolean);
        for (const interestName of interestsArray) {
          await supabase.from('interests').insert({
            profile_id: profile.id,
            interest_name: interestName,
          });
        }
      }

      navigate('/profile');
    } catch (error) {
      console.error('Error setting up profile:', error);
      alert('Failed to set up profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/dashboard" className="text-gray-400 hover:text-white">
            ← Back to Dashboard
          </Link>
          <HomeButton />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-gray-400 mb-8">
            Add more details to help others discover you and build your Digital ID
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-4">
                Profile Image
              </label>
              <ProfileImageUpload
                currentImageUrl={profileImageUrl}
                currentImageType={imageType}
                onImageChange={(url, type) => {
                  setProfileImageUrl(url);
                  setImageType(type);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                rows={4}
                placeholder="Tell us about yourself, your goals, and what you're passionate about..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Passion Field
              </label>
              <input
                type="text"
                value={formData.passionField}
                onChange={(e) => setFormData({ ...formData, passionField: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                placeholder="e.g., EdTech, Fintech, Healthcare Innovation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                placeholder="e.g., React, Python, UI Design, Project Management"
              />
              <p className="text-gray-500 text-sm mt-1">Separate multiple skills with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Interests (comma-separated)
              </label>
              <input
                type="text"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                placeholder="e.g., Entrepreneurship, Machine Learning, Social Impact"
              />
              <p className="text-gray-500 text-sm mt-1">Separate multiple interests with commas</p>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold mb-4">Portfolio Links</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="https://github.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Portfolio Website
                  </label>
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Behance URL
                  </label>
                  <input
                    type="url"
                    value={formData.behanceUrl}
                    onChange={(e) => setFormData({ ...formData, behanceUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="https://behance.net/username"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="openToStartups"
                checked={formData.isOpenToStartups}
                onChange={(e) => setFormData({ ...formData, isOpenToStartups: e.target.checked })}
                className="w-5 h-5 bg-black border border-gray-700 rounded focus:ring-green-500"
              />
              <label htmlFor="openToStartups" className="text-sm">
                I'm open to joining or building startup teams
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Complete Profile'}
              </button>

              <Link
                to="/profile"
                className="px-6 py-3 border border-gray-700 rounded-lg hover:border-green-500 transition-colors text-center"
              >
                Skip for Now
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
