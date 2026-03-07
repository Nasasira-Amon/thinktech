import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { AIMatchingService, SkillMatch, TeamRecommendation } from '../lib/aiServices';
import { HomeButton } from '../components/HomeButton';
import {
  Users,
  Sparkles,
  TrendingUp,
  Target,
  Heart,
  MessageCircle,
  UserPlus,
  Loader,
  CheckCircle
} from 'lucide-react';

export function AIMatching() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [skillMatches, setSkillMatches] = useState<SkillMatch[]>([]);
  const [teamRecommendations, setTeamRecommendations] = useState<TeamRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState<'peers' | 'teams'>('peers');
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profile) {
        setStudentProfile(profile);

        const matches = await AIMatchingService.findComplementarySkills(profile.id);
        setSkillMatches(matches);

        const teams = await AIMatchingService.findTeamMatches(profile.id);
        setTeamRecommendations(teams);

        await AIMatchingService.generateRecommendations(profile.id);
      }
    } catch (error) {
      console.error('Error loading matching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function sendCollaborationRequest(recipientId: string) {
    if (!studentProfile) return;

    setSendingRequest(recipientId);
    try {
      await supabase.from('collaboration_requests').insert({
        requester_id: studentProfile.id,
        recipient_id: recipientId,
        request_type: 'connection',
        message: 'I would love to connect and explore collaboration opportunities!',
      });
      alert('Connection request sent successfully!');
    } catch (error) {
      console.error('Error sending request:', error);
      alert('Failed to send request');
    } finally {
      setSendingRequest(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/dashboard" className="text-gray-400 hover:text-white">
            ← Back
          </Link>
          <HomeButton />
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-green-500" />
            <h1 className="text-3xl font-bold">AI-Powered Matching</h1>
          </div>
          <p className="text-gray-400">
            Discover complementary collaborators and perfect team fits based on your skills and interests
          </p>
        </div>

        <div className="flex gap-4 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('peers')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'peers'
                ? 'text-green-500 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Peer Matches ({skillMatches.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'teams'
                ? 'text-green-500 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Team Opportunities ({teamRecommendations.length})
            </div>
          </button>
        </div>

        {activeTab === 'peers' && (
          <div className="space-y-4">
            {skillMatches.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No matches found yet</h3>
                <p className="text-gray-400 mb-6">
                  Add more skills and interests to your profile to get better matches
                </p>
                <Link
                  to="/profile/edit"
                  className="inline-block px-6 py-3 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Update Profile
                </Link>
              </div>
            ) : (
              skillMatches.map((match) => (
                <div
                  key={match.studentId}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-green-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{match.studentName}</h3>
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <span className="text-green-500 font-medium">
                          {Math.round(match.matchScore * 100)}% Match
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => sendCollaborationRequest(match.studentId)}
                        disabled={sendingRequest === match.studentId}
                        className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                      >
                        {sendingRequest === match.studentId ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                        Connect
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {match.complementarySkills.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">
                          Complementary Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {match.complementarySkills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-sm border border-blue-500/30"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {match.sharedInterests.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">
                          Shared Interests
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {match.sharedInterests.map((interest, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm border border-green-500/30"
                            >
                              <Heart className="w-3 h-3 inline mr-1" />
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="space-y-4">
            {teamRecommendations.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No team matches found</h3>
                <p className="text-gray-400 mb-6">
                  Check back later or browse available teams in the Startups section
                </p>
                <Link
                  to="/startups"
                  className="inline-block px-6 py-3 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Browse Teams
                </Link>
              </div>
            ) : (
              teamRecommendations.map((team) => (
                <div
                  key={team.teamId}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-green-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{team.teamName}</h3>
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-green-500 font-medium">
                          {Math.round(team.matchScore * 100)}% Skills Match
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/startups"
                      className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                      View Team
                    </Link>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">
                        Your Matching Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {team.matchingSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm border border-green-500/30"
                          >
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {team.requiredSkills.filter(
                      (s) => !team.matchingSkills.includes(s)
                    ).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">
                          Other Required Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {team.requiredSkills
                            .filter((s) => !team.matchingSkills.includes(s))
                            .map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-gray-800 text-gray-400 rounded-full text-sm border border-gray-700"
                              >
                                {skill}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
