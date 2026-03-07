import { supabase } from './supabase';

export interface SkillMatch {
  studentId: string;
  studentName: string;
  matchScore: number;
  complementarySkills: string[];
  sharedInterests: string[];
}

export interface TeamRecommendation {
  teamId: string;
  teamName: string;
  matchScore: number;
  requiredSkills: string[];
  matchingSkills: string[];
}

export interface AIRecommendation {
  id: string;
  type: 'team_match' | 'skill_peer' | 'project_collab';
  recommendedStudentId?: string;
  recommendedTeamId?: string;
  matchScore: number;
  matchingFactors: Record<string, any>;
  viewed: boolean;
  actioned: boolean;
}

export class AIMatchingService {
  static async findComplementarySkills(
    studentId: string,
    limit: number = 10
  ): Promise<SkillMatch[]> {
    try {
      const { data: currentStudent } = await supabase
        .from('student_profiles')
        .select('id, full_name')
        .eq('id', studentId)
        .maybeSingle();

      if (!currentStudent) return [];

      const { data: mySkills } = await supabase
        .from('student_skills_enhanced')
        .select('skill_name, skill_category')
        .eq('student_id', studentId);

      const { data: myInterests } = await supabase
        .from('student_interests_enhanced')
        .select('interest_name')
        .eq('student_id', studentId);

      const mySkillNames = new Set(mySkills?.map(s => s.skill_name) || []);
      const myInterestNames = new Set(myInterests?.map(i => i.interest_name) || []);

      const { data: otherStudents } = await supabase
        .from('student_profiles')
        .select(`
          id,
          full_name,
          student_skills_enhanced(skill_name, skill_category),
          student_interests_enhanced(interest_name)
        `)
        .neq('id', studentId)
        .limit(100);

      const matches: SkillMatch[] = [];

      for (const student of otherStudents || []) {
        const theirSkills = student.student_skills_enhanced || [];
        const theirInterests = student.student_interests_enhanced || [];

        const complementarySkills = theirSkills
          .filter((s: any) => !mySkillNames.has(s.skill_name))
          .map((s: any) => s.skill_name);

        const sharedInterests = theirInterests
          .filter((i: any) => myInterestNames.has(i.interest_name))
          .map((i: any) => i.interest_name);

        const matchScore = this.calculateMatchScore(
          complementarySkills.length,
          sharedInterests.length,
          theirSkills.length
        );

        if (matchScore > 0.3) {
          matches.push({
            studentId: student.id,
            studentName: student.full_name,
            matchScore,
            complementarySkills: complementarySkills.slice(0, 5),
            sharedInterests: sharedInterests.slice(0, 5),
          });
        }
      }

      matches.sort((a, b) => b.matchScore - a.matchScore);
      return matches.slice(0, limit);
    } catch (error) {
      console.error('Error finding complementary skills:', error);
      return [];
    }
  }

  static async findTeamMatches(studentId: string): Promise<TeamRecommendation[]> {
    try {
      const { data: mySkills } = await supabase
        .from('student_skills_enhanced')
        .select('skill_name')
        .eq('student_id', studentId);

      const mySkillNames = new Set(mySkills?.map(s => s.skill_name) || []);

      const { data: teams } = await supabase
        .from('teams_enhanced')
        .select('*')
        .eq('status', 'forming');

      const recommendations: TeamRecommendation[] = [];

      for (const team of teams || []) {
        const requiredSkills = (team.required_skills as string[]) || [];
        const matchingSkills = requiredSkills.filter(skill => mySkillNames.has(skill));

        if (matchingSkills.length > 0) {
          const matchScore = matchingSkills.length / Math.max(requiredSkills.length, 1);
          recommendations.push({
            teamId: team.id,
            teamName: team.name,
            matchScore,
            requiredSkills,
            matchingSkills,
          });
        }
      }

      recommendations.sort((a, b) => b.matchScore - a.matchScore);
      return recommendations.slice(0, 5);
    } catch (error) {
      console.error('Error finding team matches:', error);
      return [];
    }
  }

  static async getRecommendations(studentId: string): Promise<AIRecommendation[]> {
    try {
      const { data } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('student_id', studentId)
        .eq('viewed', false)
        .order('match_score', { ascending: false })
        .limit(10);

      return (data || []).map(rec => ({
        id: rec.id,
        type: rec.recommendation_type,
        recommendedStudentId: rec.recommended_student_id,
        recommendedTeamId: rec.recommended_team_id,
        matchScore: rec.match_score,
        matchingFactors: rec.matching_factors,
        viewed: rec.viewed,
        actioned: rec.actioned,
      }));
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  static async markRecommendationViewed(recommendationId: string): Promise<void> {
    await supabase
      .from('ai_recommendations')
      .update({ viewed: true })
      .eq('id', recommendationId);
  }

  static async generateRecommendations(studentId: string): Promise<void> {
    try {
      const skillMatches = await this.findComplementarySkills(studentId, 5);
      const teamMatches = await this.findTeamMatches(studentId);

      const { data: profile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('id', studentId)
        .maybeSingle();

      if (!profile) return;

      const recommendations = [];

      for (const match of skillMatches) {
        recommendations.push({
          student_id: studentId,
          recommendation_type: 'skill_peer',
          recommended_student_id: match.studentId,
          match_score: match.matchScore,
          matching_factors: {
            complementarySkills: match.complementarySkills,
            sharedInterests: match.sharedInterests,
          },
        });
      }

      for (const teamMatch of teamMatches) {
        recommendations.push({
          student_id: studentId,
          recommendation_type: 'team_match',
          recommended_team_id: teamMatch.teamId,
          match_score: teamMatch.matchScore,
          matching_factors: {
            requiredSkills: teamMatch.requiredSkills,
            matchingSkills: teamMatch.matchingSkills,
          },
        });
      }

      if (recommendations.length > 0) {
        await supabase.from('ai_recommendations').insert(recommendations);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  }

  private static calculateMatchScore(
    complementaryCount: number,
    sharedInterestCount: number,
    totalSkillCount: number
  ): number {
    const complementaryWeight = 0.6;
    const interestWeight = 0.4;

    const complementaryScore = Math.min(complementaryCount / 5, 1);
    const interestScore = Math.min(sharedInterestCount / 3, 1);

    return complementaryWeight * complementaryScore + interestWeight * interestScore;
  }
}

export class ProfileCompleteness {
  static calculateScore(profile: any, skills: any[], interests: any[], portfolios: any[]): number {
    let score = 0;

    if (profile.full_name) score += 10;
    if (profile.student_number) score += 10;
    if (profile.program) score += 10;
    if (profile.year_of_study) score += 10;
    if (profile.bio) score += 10;
    if (profile.profile_image_url) score += 10;
    if (profile.university_id) score += 10;

    if (skills.length >= 3) score += 10;
    if (skills.length >= 5) score += 5;

    if (interests.length >= 2) score += 10;
    if (interests.length >= 4) score += 5;

    if (portfolios.length >= 1) score += 10;

    return Math.min(score, 100);
  }

  static async updateProfileCompleteness(studentId: string): Promise<number> {
    try {
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', studentId)
        .maybeSingle();

      const { data: skills } = await supabase
        .from('student_skills_enhanced')
        .select('*')
        .eq('student_id', studentId);

      const { data: interests } = await supabase
        .from('student_interests_enhanced')
        .select('*')
        .eq('student_id', studentId);

      const { data: portfolios } = await supabase
        .from('student_portfolios')
        .select('*')
        .eq('student_id', studentId);

      const score = this.calculateScore(
        profile || {},
        skills || [],
        interests || [],
        portfolios || []
      );

      await supabase
        .from('student_profiles')
        .update({ profile_completeness: score })
        .eq('id', studentId);

      return score;
    } catch (error) {
      console.error('Error updating profile completeness:', error);
      return 0;
    }
  }
}
