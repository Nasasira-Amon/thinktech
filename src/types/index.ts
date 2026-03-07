// Type definitions for the EduID Africa application
// These interfaces ensure type safety across the entire application

// University represents an educational institution
export interface University {
  id: string; // Unique identifier (UUID)
  name: string; // Full official name of the university
  country: string; // Country where university is located
  abbreviation?: string; // Optional short name or acronym
  created_at: string; // Timestamp of record creation
}

// StudentProfile represents a verified student's digital identity
export interface StudentProfile {
  id: string; // Unique profile identifier (UUID)
  user_id: string; // Links to authentication user ID
  university_id: string; // Links to University table
  full_name: string; // Student's complete name
  student_number: string; // Registration/matriculation number
  program: string; // Degree program (e.g., "Computer Science")
  year_of_study: number; // Current academic year (1-5)
  passion_field?: string; // What student actually wants to pursue
  bio?: string; // Personal description/biography
  is_verified: boolean; // Whether university has verified this student
  is_open_to_startups: boolean; // Availability for team formation
  privacy_level: 'full' | 'skills_only' | 'status_only' | 'hidden'; // Privacy setting
  github_url?: string; // GitHub profile link
  linkedin_url?: string; // LinkedIn profile link
  portfolio_url?: string; // Personal website/portfolio link
  behance_url?: string; // Behance portfolio link
  created_at: string; // Profile creation timestamp
  updated_at: string; // Last modification timestamp
}

// Skill represents a technical or professional capability
export interface Skill {
  id: string; // Unique skill record identifier
  profile_id: string; // Links to StudentProfile
  skill_name: string; // Name of the skill (e.g., "React", "Python")
  created_at: string; // When skill was added
}

// Interest represents an area of passion or curiosity
export interface Interest {
  id: string; // Unique interest record identifier
  profile_id: string; // Links to StudentProfile
  interest_name: string; // Interest area (e.g., "AI", "Climate Tech")
  created_at: string; // When interest was added
}

// Connection represents a link between two students
export interface Connection {
  id: string; // Unique connection identifier
  sender_id: string; // User who initiated connection request
  receiver_id: string; // User who received connection request
  status: 'pending' | 'accepted' | 'declined'; // Current connection state
  created_at: string; // When request was sent
  updated_at: string; // When status last changed
}

// StartupIdea represents a project or business concept
export interface StartupIdea {
  id: string; // Unique startup idea identifier
  creator_id: string; // User who created this idea
  title: string; // Project/startup title
  description: string; // Detailed description
  problem: string; // Problem being solved
  target_sector: string; // Industry (health, fintech, education, etc.)
  required_roles: string[]; // Array of roles needed (e.g., ["developer", "designer"])
  created_at: string; // Idea creation timestamp
  updated_at: string; // Last modification timestamp
}

// TeamMember represents membership in a startup team
export interface TeamMember {
  id: string; // Unique team member record identifier
  startup_id: string; // Links to StartupIdea
  profile_id: string; // Links to StudentProfile
  role: string; // Member's role in the team
  status: 'invited' | 'accepted' | 'declined'; // Invitation/membership status
  joined_at: string; // Timestamp of joining/invitation
}

// CourseOutline represents academic curriculum data
export interface CourseOutline {
  id: string; // Unique course outline identifier
  profile_id: string; // Student who uploaded this outline
  university_id: string; // University offering this course
  course_name: string; // Full course name
  course_code: string; // Official course code (e.g., "CS101")
  semester: string; // When course is offered (e.g., "Semester 1")
  year: number; // Academic year level
  modules: string[]; // Array of topics/modules covered
  created_at: string; // Upload timestamp
  updated_at: string; // Last modification timestamp
}

// CourseComment represents a discussion post on a course
export interface CourseComment {
  id: string; // Unique comment identifier
  course_id: string; // Links to CourseOutline
  profile_id: string; // Student who posted comment
  comment_text: string; // Comment content
  resource_url?: string; // Optional link to resource (PDF, video, etc.)
  created_at: string; // Comment timestamp
}

// UserRole defines access permissions
export interface UserRole {
  id: string; // Unique role assignment identifier
  user_id: string; // Links to authenticated user
  role: 'student' | 'admin'; // Access level
  created_at: string; // Role assignment timestamp
}

// Extended profile type that includes related data for display purposes
// This is used when fetching profile with joined data from other tables
export interface ProfileWithDetails extends StudentProfile {
  university?: University; // University object (joined data)
  skills?: Skill[]; // Array of student's skills
  interests?: Interest[]; // Array of student's interests
}
