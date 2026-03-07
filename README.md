# VersePass ID Africa

**AI-Powered Digital Student Identity & Collaboration Network**

VersePass ID Africa is a comprehensive platform that enables university students across East Africa to:
- Maintain verified digital student identities
- Discover and connect with complementary collaborators using AI
- Form interdisciplinary startup teams
- Share academic resources across universities
- Build portfolios and showcase projects

## Features

### 🆔 Verified Digital Identity
- University-verified student profiles
- Secure digital ID cards with QR codes
- Privacy controls for profile visibility
- Profile completeness scoring

### 🤖 AI-Powered Matching
- Intelligent skill-based peer matching
- Complementary skill discovery
- Team recommendation system
- Collaboration opportunity scoring
- Interest-based connection suggestions

### 👥 Collaboration Network
- Connection requests with match scoring
- Direct messaging between students
- Cross-university networking
- Team formation and management
- Role-based team membership

### 💼 Startup Ecosystem
- Create and join startup teams
- Skill-requirement matching
- Innovation sector categorization
- Team discovery and recruitment
- Project collaboration tools

### 📚 Academic Resource Sharing
- Course outline exchange
- Learning material sharing
- University-specific resources
- Public and private resource visibility
- Resource rating system

### 🎯 Skills & Interests
- Comprehensive skill profiling
- Proficiency level tracking
- Peer skill endorsements
- Interest intensity metrics
- Category-based organization

### 📊 Portfolio Management
- Project showcase
- Technology stack tracking
- GitHub integration
- Impact metrics
- Portfolio-based matching

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Lucide React for icons
- QR Code generation

### Backend & Database
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Real-time subscriptions
- Authentication & Authorization
- File storage

### AI & Matching
- Custom AI matching algorithms
- Skill complementarity scoring
- Interest similarity analysis
- Team fit calculations
- Profile completeness AI

## Database Schema

### Core Tables
- `student_profiles` - Student biographical data and settings
- `universities` - University verification data
- `student_skills_enhanced` - Skills with proficiency and endorsements
- `student_interests_enhanced` - Interests with intensity levels
- `student_portfolios` - Project portfolios and work history

### Collaboration Tables
- `collaboration_requests` - Connection and team invitations
- `teams_enhanced` - Startup teams and project groups
- `team_members_enhanced` - Team membership and roles
- `ai_recommendations` - AI-generated matching suggestions

### Verification & Resources
- `student_verifications` - University verification tracking
- `skill_endorsements` - Peer skill validation
- `academic_resources` - Shared learning materials

## Key AI Features

### Skill Matching Algorithm
The AI matching system analyzes:
1. **Complementary Skills** - Finds students with different but complementary skills
2. **Shared Interests** - Identifies common passion areas and innovation sectors
3. **Team Fit** - Matches students to teams based on required skills
4. **Match Scoring** - Computes compatibility scores (0-100%)

### Profile Completeness
Automatic scoring based on:
- Basic information (50 points)
- Skills (15 points)
- Interests (15 points)
- Portfolio projects (10 points)
- Social links (10 points)

### Recommendation Engine
Generates personalized recommendations for:
- Peer connections (skill_peer)
- Team opportunities (team_match)
- Project collaborations (project_collab)

## Security & Privacy

### Row Level Security (RLS)
All database tables protected with Supabase RLS policies:
- Students can only edit their own data
- Visibility controls respect privacy settings
- University-specific resource access
- Team-based permissions

### Privacy Levels
- **Public** - Everyone can see profile
- **Limited** - Only verified students
- **Private** - Only connections
- **University Only** - Same institution students

### Verification System
- Email domain verification
- University admin approval
- Document verification
- Manual verification by administrators

## Mobile Optimization

Built for African connectivity constraints:
- Minimal API payload sizes
- Progressive loading
- Offline-capable features
- Responsive mobile-first design
- Optimized image loading
- Cached profile queries

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase credentials to .env

# Run database migrations
# Migrations are in supabase/migrations/

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
src/
├── components/        # Reusable UI components
├── contexts/         # React context providers
├── data/            # Static data and configurations
├── lib/             # Utility libraries and services
│   ├── supabase.ts  # Supabase client
│   └── aiServices.ts # AI matching algorithms
├── pages/           # Page components
│   ├── AIMatching.tsx    # AI-powered matching
│   ├── Dashboard.tsx      # Main dashboard
│   ├── Discover.tsx       # Student directory
│   ├── ProfileSetup.tsx   # Profile creation
│   └── ...
├── types/           # TypeScript type definitions
└── main.tsx         # Application entry point
```

## API Usage

### AI Matching Service

```typescript
import { AIMatchingService } from './lib/aiServices';

// Find complementary skill matches
const matches = await AIMatchingService.findComplementarySkills(studentId, 10);

// Find team opportunities
const teams = await AIMatchingService.findTeamMatches(studentId);

// Generate AI recommendations
await AIMatchingService.generateRecommendations(studentId);

// Get existing recommendations
const recommendations = await AIMatchingService.getRecommendations(studentId);
```

### Profile Completeness

```typescript
import { ProfileCompleteness } from './lib/aiServices';

// Calculate and update profile completeness
const score = await ProfileCompleteness.updateProfileCompleteness(studentId);
```

## Contributing

We welcome contributions from the community! Areas for contribution:
- Enhanced AI matching algorithms
- Additional verification methods
- Mobile app development
- Localization (Swahili, Luganda, etc.)
- Performance optimizations

## Supported Universities

- Makerere University (Uganda)
- University of Nairobi (Kenya)
- University of Dar es Salaam (Tanzania)
- Kenyatta University (Kenya)
- Kampala International University (Uganda)
- Mbarara University of Science and Technology (Uganda)
- Busitema University (Uganda)

## Future Roadmap

- [ ] Vector embeddings for advanced AI matching
- [ ] Integration with LinkedIn and GitHub
- [ ] Mobile native apps (iOS/Android)
- [ ] Video introduction profiles
- [ ] Virtual collaboration spaces
- [ ] Hackathon and event management
- [ ] Alumni network integration
- [ ] Corporate partnership portal
- [ ] Funding opportunity matching
- [ ] Academic credit verification

## License

This project is licensed under the MIT License.

## Support

For support, email support@versepass.africa or join our community Slack channel.

## Acknowledgments

Built with support from:
- ThinkTech Hub
- East African university partners
- Student innovation community

---

**VersePass ID Africa** - Empowering student innovation across East Africa through AI-powered collaboration.
