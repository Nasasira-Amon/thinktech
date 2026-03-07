import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { StudentProfile, Skill, Interest } from '../types';
import ProfileImageUpload from '../components/ProfileImageUpload';

export function ProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [existingSkills, setExistingSkills] = useState<Skill[]>([]);
  const [existingInterests, setExistingInterests] = useState<Interest[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [imageType, setImageType] = useState<'upload' | 'avatar'>('avatar');

  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    passionField: '',
    yearOfStudy: 1,
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    behanceUrl: '',
    privacyLevel: 'full' as 'full' | 'limited' | 'private',
    isOpenToStartups: false,
    newSkills: '',
    newInterests: '',
  });

  const [skillsToDelete, setSkillsToDelete] = useState<string[]>([]);
  const [interestsToDelete, setInterestsToDelete] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  async function fetchProfileData() {
    if (!user) return;

    try {
      const { data: profileData } = await supabase
        .from('student_profiles')
        .select('*, university:universities(*)')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        setProfileImageUrl(profileData.profile_image_url || '');
        setImageType(profileData.image_type || 'avatar');
        setFormData({
          fullName: profileData.full_name || '',
          bio: profileData.bio || '',
          passionField: profileData.passion_field || '',
          yearOfStudy: profileData.year_of_study || 1,
          githubUrl: profileData.github_url || '',
          linkedinUrl: profileData.linkedin_url || '',
          portfolioUrl: profileData.portfolio_url || '',
          behanceUrl: profileData.behance_url || '',
          privacyLevel: profileData.privacy_level || 'full',
          isOpenToStartups: profileData.is_open_to_startups || false,
          newSkills: '',
          newInterests: '',
        });

        const { data: skillsData } = await supabase
          .from('skills')
          .select('*')
          .eq('profile_id', profileData.id);
        if (skillsData) setExistingSkills(skillsData);

        const { data: interestsData } = await supabase
          .from('interests')
          .select('*')
          .eq('profile_id', profileData.id);
        if (interestsData) setExistingInterests(interestsData);
      }

      // Universities data fetched if needed in future
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }

  function removeSkill(skillId: string) {
    setSkillsToDelete([...skillsToDelete, skillId]);
    setExistingSkills(existingSkills.filter(s => s.id !== skillId));
  }

  function removeInterest(interestId: string) {
    setInterestsToDelete([...interestsToDelete, interestId]);
    setExistingInterests(existingInterests.filter(i => i.id !== interestId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;

    setSaving(true);

    try {
      await supabase
        .from('student_profiles')
        .update({
          full_name: formData.fullName,
          bio: formData.bio || null,
          passion_field: formData.passionField || null,
          year_of_study: formData.yearOfStudy,
          github_url: formData.githubUrl || null,
          linkedin_url: formData.linkedinUrl || null,
          portfolio_url: formData.portfolioUrl || null,
          behance_url: formData.behanceUrl || null,
          privacy_level: formData.privacyLevel,
          is_open_to_startups: formData.isOpenToStartups,
          profile_image_url: profileImageUrl || null,
          image_type: imageType,
        })
        .eq('id', profile.id);

      for (const skillId of skillsToDelete) {
        await supabase.from('skills').delete().eq('id', skillId);
      }

      for (const interestId of interestsToDelete) {
        await supabase.from('interests').delete().eq('id', interestId);
      }

      if (formData.newSkills) {
        const skillsArray = formData.newSkills.split(',').map(s => s.trim()).filter(Boolean);
        for (const skillName of skillsArray) {
          await supabase.from('skills').insert({
            profile_id: profile.id,
            skill_name: skillName,
          });
        }
      }

      if (formData.newInterests) {
        const interestsArray = formData.newInterests.split(',').map(i => i.trim()).filter(Boolean);
        for (const interestName of interestsArray) {
          await supabase.from('interests').insert({
            profile_id: profile.id,
            interest_name: interestName,
          });
        }
      }

      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Profile not found</p>
          <Link to="/dashboard" className="text-green-500 hover:text-green-400">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link to="/profile" className="text-gray-400 hover:text-white">
            ← Back to Profile
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Edit Your Profile</h1>
          <p className="text-gray-400 mb-8">
            Update your information and manage your Digital ID
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
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Year of Study
              </label>
              <select
                value={formData.yearOfStudy}
                onChange={(e) => setFormData({ ...formData, yearOfStudy: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value={1}>Year 1</option>
                <option value={2}>Year 2</option>
                <option value={3}>Year 3</option>
                <option value={4}>Year 4</option>
                <option value={5}>Year 5</option>
              </select>
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
                Privacy Level
              </label>
              <select
                value={formData.privacyLevel}
                onChange={(e) => setFormData({ ...formData, privacyLevel: e.target.value as any })}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="full">Full - Everyone can see my profile</option>
                <option value="limited">Limited - Only verified students</option>
                <option value="private">Private - Only connections</option>
              </select>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold mb-4">Skills</h3>

              {existingSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {existingSkills.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm border border-green-500/30 flex items-center gap-2"
                    >
                      {skill.skill_name}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Add New Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.newSkills}
                  onChange={(e) => setFormData({ ...formData, newSkills: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                  placeholder="e.g., React, Python, UI Design"
                />
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold mb-4">Interests</h3>

              {existingInterests.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {existingInterests.map((interest) => (
                    <span
                      key={interest.id}
                      className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700 flex items-center gap-2"
                    >
                      {interest.interest_name}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Add New Interests (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.newInterests}
                  onChange={(e) => setFormData({ ...formData, newInterests: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                  placeholder="e.g., Entrepreneurship, Machine Learning"
                />
              </div>
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
                disabled={saving}
                className="flex-1 px-6 py-3 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

              <Link
                to="/profile"
                className="px-6 py-3 border border-gray-700 rounded-lg hover:border-green-500 transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
