# Yahya El-Sawi Portfolio: Stitch Website Roadmap

## 1. Product Overview

Create a modern, polished portfolio for Yahya El-Sawi, a UI/UX and product designer based in Dubai. The website should help recruiters, hiring managers, founders, and design teams quickly understand:

- Who Yahya is and what kind of designer he is
- The quality and range of his product design work
- How he approaches problems and makes decisions
- The outcomes and value of his work
- How to contact him or view his resume

The site is a real portfolio, not a marketing landing page. Prioritize work samples, case-study clarity, credibility, and fast navigation.

## 2. Primary Goals

1. Make Yahya's role, strengths, and availability clear in the first viewport.
2. Lead visitors quickly into the strongest projects.
3. Present every case study with one consistent, reusable structure.
4. Show process without turning case studies into long walls of text.
5. Make the portfolio feel personal and distinctive while remaining professional.
6. Work beautifully on desktop, tablet, and mobile.

## 3. Target Audiences

- Product design and UI/UX recruiters
- Hiring managers and design leads
- Startup founders and potential freelance clients
- Collaborators who want to understand Yahya's capabilities

Visitors often scan quickly. Important project facts and outcomes must be understandable before they read the full case study.

## 4. Site Map

### Primary Screens

1. Home
2. Work / All Projects
3. Project Case Study Template
4. About
5. Resume
6. Contact

### Supporting Screens

7. Privacy Policy
8. 404 / Page Not Found

### Navigation

- Logo or name links to Home
- Work
- About
- Resume
- Contact
- Optional persistent "Let's talk" or contact action on desktop

Do not include a separate Home navigation item if the logo clearly returns home.

## 5. Screen Requirements

### Screen 1: Home

Purpose: Introduce Yahya and move visitors toward selected work.

Sections:

1. Header
   - Yahya wordmark or personal identity
   - Primary navigation
   - Contact action
   - Compact mobile menu

2. Hero
   - Yahya El-Sawi as the main heading
   - Literal role such as "Product Designer" or "UI/UX Designer"
   - Short positioning statement focused on solving product problems
   - Primary action: View selected work
   - Secondary action: Contact or resume
   - Strong portrait or authentic product-work visual
   - Optional availability/location detail: Dubai, UAE

3. Selected Work
   - Feature 3 to 5 strongest projects
   - Use large project imagery showing the actual interface or product
   - Each project includes title, organization, category, short challenge, role, and outcome/status
   - Mix card sizes only if hierarchy remains clear on mobile

4. Capabilities / Working Style
   - Concise list rather than decorative service cards
   - Product design, UX research, interaction design, prototyping, design systems, and usability testing

5. Short About Preview
   - Portrait
   - Two or three sentences showing personality and approach
   - Link to full About page

6. Contact CTA
   - Direct and personal closing statement
   - Email and contact-page action

7. Footer
   - Name, navigation, email, LinkedIn, GitHub, privacy, copyright

### Screen 2: Work / All Projects

Purpose: Let visitors scan and compare all projects.

Sections:

1. Page introduction
   - Heading: Selected Work or Work
   - Short statement about the type of problems Yahya solves

2. Optional project filters
   - All
   - Product Design
   - Mobile
   - UX Research
   - Systems / Technical
   - Only include filters if there will be enough projects to make them useful

3. Project index
   - Responsive grid or editorial list
   - Consistent Project Card component
   - Project screenshot, not only a company logo
   - Title, organization, year, type, role, summary, and strongest outcome
   - Clearly distinguish full case studies from concept or academic projects

4. Contact CTA and footer

### Screen 3: Project Case Study Template

Purpose: Explain the project, Yahya's contribution, decisions, and results.

Every project uses the same information architecture while allowing varied visual storytelling.

Sections:

1. Case-study hero
   - Project title
   - Organization/client
   - One-sentence project summary
   - Large, high-quality product visual
   - Role, timeline, team, platform, and project type
   - Optional live prototype or Figma link

2. Executive summary
   - The problem
   - What Yahya did
   - The result
   - Show this in a quickly scannable format

3. Context and constraints
   - Business or user context
   - Scope
   - Limitations and constraints
   - Clearly state whether the project was professional, academic, personal, or conceptual

4. Research and evidence
   - Research methods
   - Main findings
   - Quotes, observations, analytics, or other evidence where available
   - Avoid generic process diagrams without project-specific meaning

5. Problem definition
   - Key user needs
   - Jobs, pain points, or opportunity areas
   - The design question or success criteria

6. Exploration and decisions
   - Flows, information architecture, sketches, wireframes, or alternatives
   - Explain important tradeoffs and why one direction was chosen

7. Final solution
   - Large interface screenshots
   - Organize by user task or feature rather than a gallery with no explanation
   - Use captions to explain the design decision shown in each image

8. Results and impact
   - Verified metrics when available
   - Qualitative outcomes when metrics are unavailable
   - Label hypotheses, proposed A/B tests, and estimated improvements honestly

9. Reflection
   - What worked
   - What Yahya learned
   - What he would improve or test next

10. Next project navigation
   - Previous/next project
   - Back to all work
   - Contact CTA

Optional case-study navigation:

- Sticky desktop table of contents
- Compact mobile section menu or progress indicator

### Screen 4: About

Purpose: Build trust and show the person behind the work.

Sections:

1. Intro with authentic portrait
2. Personal design philosophy
3. Career story and current direction
4. Experience timeline
5. Skills and capabilities
6. Tools, kept secondary to thinking and outcomes
7. Education and selected certificates
8. Personal details or interests that add genuine character
9. Resume and contact actions

Avoid presenting every item as a separate floating card. Use an editorial page with clear bands, columns, and rhythm.

### Screen 5: Resume

Purpose: Give recruiters a quick summary and easy access to the PDF.

Sections:

1. Heading and short summary
2. Download Resume action
3. Open PDF action
4. Readable HTML summary of experience, education, and key skills
5. Selected certifications

Do not rely only on an embedded PDF, especially on mobile.

### Screen 6: Contact

Purpose: Make starting a conversation easy.

Sections:

1. Friendly, concise invitation
2. Email address
3. Contact form: name, email, subject/project type, message
4. Clear success, sending, validation, and error states
5. LinkedIn and GitHub links
6. Location and optional availability status
7. Privacy reassurance near the form

### Screen 7: Privacy Policy

Use a restrained text layout with readable line length. Cover analytics, the contact form, cookies, third-party services, retention, and contact details.

### Screen 8: 404

Keep it concise and on-brand. Include links to Home and Work.

## 6. Existing Project Inventory

The new system must initially support these five projects:

1. Gift It: Checkout and E-Invite Flow Redesign
   - Product/UX design
   - Checkout funnel, gifting steps, confirmation, and transactional email UX

2. RIT Dubai: Student App 2.0
   - Mobile product design
   - Sign-in, notifications, myCourses, SIS, and common student tasks

3. Gift It: Login and Signup Redesign
   - Mobile-first authentication
   - Shorter registration and passwordless email-code login

4. Vehicle Rental Operations Dashboard
   - Data and systems project
   - Database schema translated into operational dashboard workflows

5. Mood Insights and Stress Alerts
   - Mobile wellness concept
   - Daily check-ins, mood insights, trends, and stress alerts

Also reserve the design for at least three additional projects. New project cards and case-study pages must not require a new layout.

## 7. Reusable Project Data

Design every project around this shared content model:

- Slug
- Project title
- Organization/client
- Year
- Short summary
- Full introduction
- Project status: professional, freelance, academic, personal, or concept
- Featured status and display order
- Category/tags
- Role
- Timeline
- Team
- Platform
- Tools
- Hero image
- Thumbnail image
- Image alt text
- Problem
- Constraints
- Research methods
- Key insights
- Design goals
- Process sections
- Final solution sections
- Verified outcomes
- Proposed outcomes or hypotheses
- Learnings
- Prototype/live links
- Previous and next project

## 8. Shared Components and States

Stitch should design these as reusable components:

- Desktop header
- Mobile header and open mobile menu
- Footer
- Primary, secondary, text, and icon buttons
- Project card in featured and standard variants
- Case-study metadata row
- Metric/result block
- Quote or research insight
- Image with caption
- Image gallery/lightbox trigger
- Section heading
- Tag/filter control
- Form fields and textarea
- Empty, loading, success, validation, and error states
- Previous/next project navigation
- Scroll-to-top control if retained

For every interactive component, include default, hover, focus, active, and disabled states where relevant.

## 9. Responsive Screens Required

Create at least these frames:

- Desktop: 1440px wide
- Tablet: approximately 768px wide
- Mobile: approximately 390px wide

At minimum, provide all three sizes for Home, Work, one full case study, About, and Contact. Supporting pages may use responsive components from those screens.

Mobile must be intentionally composed, not merely a stacked desktop page. Keep touch targets at least 44px, prevent horizontal overflow, and keep headings and long project titles inside their containers.

## 10. Accessibility and Usability

- Use one clear H1 per page
- Maintain WCAG AA color contrast
- Provide visible keyboard focus states
- Do not rely on color alone to communicate state
- Use meaningful button and link labels
- Provide alt-text guidance for all project imagery
- Respect reduced-motion preferences
- Avoid autoplay motion that cannot be paused
- Make carousels usable with touch, keyboard, and controls; prefer static layouts when a carousel adds little value
- Keep body text readable and line lengths controlled

## 11. Visual Direction Guardrails

Follow the visual direction supplied separately by Yahya, while observing these structural rules:

- The work must be visible in the first viewport
- Use authentic interface imagery and portraits
- Use strong typography and spacing rather than excessive decoration
- Avoid generic SaaS landing-page sections
- Avoid nested cards and card-heavy layouts
- Avoid decorative gradient blobs, floating orbs, and stock-style visual filler
- Keep card corner radii restrained and consistent
- Use motion to explain hierarchy or interaction, not as decoration
- Preserve enough contrast between page background, surfaces, text, and media
- Make the portfolio feel personal, confident, modern, and credible

## 12. Content and SEO Requirements

Every page design must support:

- Unique page title and description
- Canonical URL
- Social sharing title, description, and image
- Structured project and person metadata
- Descriptive URLs such as `/work/rit-student-app`
- Generated sitemap
- Project image dimensions that work for both cards and social previews

## 13. Recommended Visitor Journey

1. Visitor understands Yahya's role and value in a few seconds.
2. Visitor opens a featured project from Home.
3. Case-study summary establishes relevance before the long-form process.
4. Visitor scans decisions, final screens, and outcomes.
5. Previous/next navigation leads to another relevant project.
6. About or Resume confirms experience and fit.
7. Contact provides a low-friction way to start a conversation.

## 14. Stitch Deliverables

Produce:

1. A small foundations page with colors, typography, spacing, grid, radii, shadows, and motion rules
2. Reusable components and their states
3. Desktop, tablet, and mobile navigation
4. Home at desktop, tablet, and mobile sizes
5. Work index at desktop, tablet, and mobile sizes
6. One complete case study at desktop, tablet, and mobile sizes
7. Variations showing how the same case-study system supports the other projects
8. About at desktop and mobile sizes
9. Resume at desktop and mobile sizes
10. Contact at desktop and mobile sizes, including form states
11. Privacy and 404 screens
12. A clickable prototype for primary navigation and the Home-to-project-to-contact journey

Use consistent component naming and avoid detached one-off screen elements that cannot be reused in implementation.

## 15. Decisions Still Needed From Yahya

- Final title: Product Designer, UI/UX Designer, or another positioning
- Final portfolio domain
- Employment/freelance availability wording
- Which 3 to 5 projects are featured and their order
- Names and content of the new projects
- Which outcomes are verified metrics versus proposed improvements
- Whether dark mode is part of the new design
- Whether Resume stays as a full navigation destination
- Final portrait and project hero imagery
