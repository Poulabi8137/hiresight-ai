# Demo Scripts & Screenshot Guide

## Screenshot Checklist

Capture these screenshots for your portfolio/README:

| # | Shot | Route | Key Elements |
|---|------|-------|-------------|
| 1 | Landing Page Hero | `/` | Animated stat cards (4 metrics), "Try Demo" CTA, theme toggle |
| 2 | Landing Features | `/` (scroll) | AI workflow section, feature cards, testimonial grid, FAQ |
| 3 | Auth Page | `/auth?role=recruiter&mode=signin` | Role toggle, signin/signup mode switch, auth status panel |
| 4 | Recruiter Workspace — Candidate List | `/recruiter` | AI-ranked list, video player, match breakdown sidebar |
| 5 | Recruiter Workspace — Match Breakdown | `/recruiter` | Skill/experience/signal bars, matched/missing skills, strengths, confidence |
| 6 | Recruiter Workspace — Pipeline | `/recruiter` (scroll) | 5-stage pipeline with draggable cards |
| 7 | Analytics Dashboard | `/recruiter` (via tab) | 4 metric cards, pie/area/bar charts |
| 8 | AI Match Visualization | `/recruiter` | SVG radial gauge, signal bars, skill tags |
| 9 | Candidate Workspace | `/candidate` | Profile strength meter, progress steps |
| 10 | Jobs Page | `/jobs` | Job cards with search/filter controls |
| 11 | Upload Studio | `/upload` | Drag/drop zone, file preview, upload progress |
| 12 | Dark Mode | any route | Toggle theme, same page in dark theme |

---

## Recruiter Demo Script (3 minutes)

### Setup (30s)
1. Open your browser to `http://localhost:3000`
2. Navigate to `/auth?role=recruiter&mode=signin`
3. Pre-filled credentials: `recruiter@hiresight.ai` / `password123`
4. Sign in and land on the recruiter workspace

### Walkthrough (2m 30s)

**1. Candidate List + Video Review (60s)**
- "This is the recruiter workspace. Candidates are AI-ranked by default — the highest match scores appear first."
- Click on a candidate card to select them
- Click the video player to play their interview clip
- Point to the Match Breakdown panel on the right
- "The AI scores across three dimensions: skills, experience, and signals"
- Highlight the matched vs missing skills list
- Point out the confidence score badge

**2. Drag-and-Drop Pipeline (30s)**
- Scroll down to the pipeline section
- "Candidates flow through 5 stages: Applied → Screening → Shortlisted → Interview → Offer"
- Drag a candidate card from "Applied" to "Screening"
- "The stage updates in real-time — other users see this change instantly via Supabase Realtime"
- Drag another candidate from "Screening" to "Shortlisted"

**3. Analytics Dashboard (45s)**
- Scroll or tab to the analytics section
- "Four metric cards at the top: total candidates, average score, time in pipeline, application rate"
- Point to the pie chart: "Stage distribution — see where candidates concentrate"
- Point to the area chart: "Applications over time — track hiring velocity"
- Point to the bar charts: "Top skills across all jobs, and pipeline conversion rates between stages"

**4. AI Match Visualization (15s)**
- "The visualization panel shows a radial gauge of the match score, plus individual signal strengths"
- "Recruiters can immediately see why a candidate scored the way they did — no black box"

---

## Candidate Demo Script (1 minute)

### Setup (15s)
1. Navigate to `/auth?role=candidate&mode=signin`
2. Pre-filled credentials: `candidate@hiresight.ai` / `password123`
3. Sign in and land on the candidate workspace

### Walkthrough (45s)

**1. Profile Strength (15s)**
- "The profile strength meter shows how complete your profile is"
- "Each step — resume upload, video profile, avatar — contributes to completeness"
- "Complete profiles get higher signal scores when recruiters review them"

**2. Job Discovery (20s)**
- Navigate to `/jobs`
- "Browse open positions with search and skill filters"
- Click a job card to see details
- "Apply with one click — the system records your application and AI scores your fit"

**3. Upload Studio (10s)**
- Navigate to `/upload`
- "Drag and drop a resume, video, or avatar"
- "Files upload to Supabase Storage with signed URLs — secure and scalable"

---

## Recording Tips

1. **Resolution**: Record at 1920x1080, 60fps
2. **Audio**: Voice-over explaining what's happening
3. **Format**: MP4 or WebM
4. **Highlight regions**: Use cursor highlight/magnify during drag-and-drop
5. **Transitions**: Pause 1-2 seconds between sections for editing cuts
6. **Overlay text**: Add brief captions for key moments (e.g., "AI Match Score: 85/100")
7. **Auth flow**: If domain is localhost, pre-complete the signin to avoid focus on credentials
