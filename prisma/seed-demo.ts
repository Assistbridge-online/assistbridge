import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Local-development-only seed. Populates demo content so the site is browsable
 * without a real backend. NEVER run this on production.
 *
 * Usage:  npm run db:seed:demo
 */
async function main() {
  console.log("⚠️  Seeding DEMO data (local development only)...\n");

  await prisma.message.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.order.deleteMany();
  await prisma.expertApplication.deleteMany();
  await prisma.contactSubmission.deleteMany();
  await prisma.quoteRequest.deleteMany();
  await prisma.expertProfile.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.service.deleteMany();
  await prisma.discipline.deleteMany();
  await prisma.pricingTier.deleteMany();
  await prisma.pricingConfig.deleteMany();
  await prisma.siteStat.deleteMany();
  await prisma.serviceAcademicPrice.deleteMany();
  await prisma.academicLevel.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  // --- Pricing config ---
  await prisma.pricingConfig.create({
    data: {
      singleton: "singleton",
      pageUnitLabel: "page",
      wordsPerPage: 250,
      platformFeePercent: 15,
      rushDeliveryDays: 3,
      rushMultiplier: 1.5,
      studentDiscountPercent: 10,
      nonProfitDiscountPercent: 10,
    },
  });
  console.log("✓ Pricing config");

  // --- Disciplines ---
  const disciplinesData = [
    { slug: "science-engineering", name: "Science & Engineering", order: 1, description: "Physics, chemistry, biology, materials, mechanical, civil, electrical, and chemical engineering support.",     longDescription: "From theoretical physics to structural engineering. Get rigorous, peer-quality work delivered on time.", icon: "Microscope", tools: "MATLAB, SolidWorks, ANSYS, AutoCAD, LaTeX, Origin, COMSOL, Python", servicesList: "Lab report writing|Experimental design|FEA & CAD modeling|Data analysis|Thesis & dissertation support|Patent drafting|Technical documentation" },
    { slug: "medicine-health", name: "Medicine & Health", order: 2, description: "Nursing, public health, pharmacology, clinical research, anatomy, and biomedical writing.", longDescription: "Clinical, biomedical, and public health expertise from working researchers and clinicians.", icon: "Stethoscope", tools: "SPSS, R, Stata, RevMan, Covidence, PRISMA, EndNote", servicesList: "Clinical case reports|Literature reviews|Systematic reviews & meta-analyses|IRB protocols|Patient education materials|Epidemiological analysis" },
    { slug: "business-finance", name: "Business & Finance", order: 3, description: "MBA-level analysis, accounting, economics, marketing strategy, financial modeling, and case studies.", longDescription: "MBA-grade analysis, financial modeling, and strategy support for startups, students, and enterprise teams.", icon: "Briefcase", tools: "Excel, PowerPoint, Tableau, Power BI, Bloomberg, Capital IQ, PitchBook", servicesList: "Financial modeling|Market sizing & analysis|Pitch decks|Business plans|Case interview prep|Valuation & DCF|Strategic frameworks" },
    { slug: "technology-computing", name: "Technology & Computing", order: 4, description: "Software engineering, AI/ML, data science, cybersecurity, DevOps, and IT infrastructure.", longDescription: "Production-grade software, AI/ML, and IT support from engineers who've shipped real systems at scale.", icon: "Code2", tools: "Python, TypeScript, React, Next.js, TensorFlow, PyTorch, AWS, Docker, PostgreSQL", servicesList: "Web & mobile development|AI/ML model training|Cloud architecture|DevOps & CI/CD|Code review|Bug fixing|API design" },
    { slug: "humanities-social-sciences", name: "Humanities & Social Sciences", order: 5, description: "History, philosophy, sociology, psychology, anthropology, political science, and linguistics.", longDescription: "Qualitative research, theoretical writing, and critical analysis across the human sciences.", icon: "PenLine", tools: "NVivo, Atlas.ti, MAXQDA, Zotero, Mendeley", servicesList: "Literature reviews|Qualitative coding|Discourse analysis|Ethnographic writing|Theoretical frameworks|Annotated bibliographies" },
    { slug: "law-policy", name: "Law & Policy", order: 6, description: "Case briefs, legal memoranda, and policy analysis from JD/LLM-trained professionals.", longDescription: "Case briefs, legal memoranda, and policy analysis from JD/LLM-trained professionals.", icon: "Award", tools: "Westlaw, LexisNexis, Bloomberg Law, HeinOnline", servicesList: "Case brief writing|Legal research|Policy memos|Contract drafting|Statutory analysis|IRAC & CREAC memos" },
    { slug: "arts-design", name: "Arts & Design", order: 7, description: "Graphic design, UX, art history, music theory, film studies, and creative writing.", longDescription: "Creative direction, design production, and art-historical research with portfolio-quality output.", icon: "Sparkles", tools: "Figma, Adobe Suite, Sketch, Procreate, Blender, Cinema 4D", servicesList: "UX/UI design|Brand identity|Illustration|Art history research|Creative writing|Video editing|Portfolio review" },
    { slug: "education-academia", name: "Education & Academia", order: 8, description: "Curriculum, instructional design, and education research for K-12, higher-ed, and EdTech.", longDescription: "Curriculum, instructional design, and education research for K-12, higher-ed, and EdTech.", icon: "Users", tools: "Canvas, Moodle, Google Classroom, Articulate, Qualtrics", servicesList: "Curriculum design|Lesson planning|Assessment design|Educational research|Accessibility reviews" },
    { slug: "mathematics-statistics", name: "Mathematics & Statistics", order: 9, description: "Pure math, applied math, statistics, actuarial science, and operations research.", longDescription: "Pure math proofs, applied modeling, and rigorous statistical analysis you can defend.", icon: "Calculator", tools: "R, Python, Stata, SAS, SPSS, JMP, Mathematica, Maple", servicesList: "Proof editing|Regression analysis|Bayesian modeling|Time-series|Survey design|Hypothesis testing" },
    { slug: "environment-agriculture", name: "Environment & Agriculture", order: 10, description: "Environmental impact, climate research, and agricultural science from field-experienced specialists.", longDescription: "Environmental impact, climate research, and agricultural science from field-experienced specialists.", icon: "Globe", tools: "ArcGIS, QGIS, R, Python, HEC-RAS, SWAT", servicesList: "EIA reports|Climate modeling|GIS analysis|Agronomy research|Sustainability reporting" },
    { slug: "communications-media", name: "Communications & Media", order: 11, description: "Journalism, PR, content strategy, and digital communications that land with your audience.", longDescription: "Journalism, PR, content strategy, and digital communications that land with your audience.", icon: "PenLine", tools: "Hootsuite, Buffer, Canva, WordPress, Mailchimp, HubSpot", servicesList: "Feature writing|Press releases|Content calendars|Social media strategy|Crisis comms|Media training" },
    { slug: "architecture-construction", name: "Architecture & Construction", order: 12, description: "Architectural design, BIM, and construction management for projects of any scale.", longDescription: "Architectural design, BIM, and construction management for projects of any scale.", icon: "Wrench", tools: "AutoCAD, Revit, Rhino, SketchUp, Lumion, Primavera P6", servicesList: "Schematic design|Construction documents|BIM modeling|Quantity surveying|Site planning|Code compliance" },
    { slug: "biotechnology-biomedical", name: "Biotechnology & Biomedical Engineering", order: 13, description: "Bioinformatics, genetic engineering, biomedical devices, tissue engineering, and bioprocessing.", longDescription: "From gene sequencing to medical device design. Get bench-to-desk support from researchers with wet-lab and computational expertise.", icon: "FlaskConical", tools: "BLAST, Clustal, MATLAB SimBiology, COMSOL, Benchling, PyMOL, Galaxy, Cytoscape", servicesList: "Bioinformatics analysis|Genetic engineering protocols|Bioprocess design|Medical device documentation|In silico modeling|Grant writing" },
    { slug: "data-science-ai", name: "Data Science & Artificial Intelligence", order: 14, description: "Machine learning, deep learning, NLP, computer vision, big data analytics, and MLOps.", longDescription: "Production-ready ML/AI systems from data ingestion to deployed models. Expertise across supervised, unsupervised, and reinforcement learning.", icon: "Cpu", tools: "Python, R, TensorFlow, PyTorch, scikit-learn, Hugging Face, Spark, Kafka, Airflow, MLflow", servicesList: "Model development & training|Data pipeline engineering|NLP & text analytics|Computer vision|Time-series forecasting|MLOps & deployment" },
    { slug: "cybersecurity", name: "Cybersecurity & Information Assurance", order: 15, description: "Network security, penetration testing, cryptography, compliance (SOC2, HIPAA, GDPR), and incident response.", longDescription: "Security assessments, compliance frameworks, and defensive architecture from certified practitioners with real-world incident response experience.", icon: "Shield", tools: "Kali Linux, Wireshark, Metasploit, Burp Suite, Nessus, Splunk, Nmap, OpenVAS", servicesList: "Penetration testing|Vulnerability assessment|Security architecture review|Compliance documentation|Incident response planning|Security awareness training" },
    { slug: "aerospace-aviation", name: "Aerospace & Aviation", order: 16, description: "Aeronautical engineering, spacecraft systems, avionics, aerodynamics, propulsion, and flight mechanics.", longDescription: "Advanced aerospace analysis and design support for aircraft, spacecraft, and UAV systems. CFD, FEM, and mission planning.", icon: "Rocket", tools: "ANSYS Fluent, OpenFOAM, CATIA, NASTRAN, Simulink, STK, GMAT, XFLR5", servicesList: "Aerodynamic analysis|Propulsion system design|Structural & FEM analysis|Mission planning & trajectory|Avionics & control systems|Technical writing" },
    { slug: "neuroscience-cognitive", name: "Neuroscience & Cognitive Science", order: 17, description: "Computational neuroscience, neuroimaging, cognitive psychology, psychophysics, and neural engineering.", longDescription: "Brain research support from computational modeling to experimental design. fMRI, EEG, MEG analysis, and cognitive task development.", icon: "Brain", tools: "MATLAB, Python, FSL, SPM, EEGLAB, Psychtoolbox, AFNI, FreeSurfer, BIDS", servicesList: "fMRI & EEG analysis|Computational modeling|Experimental design|Literature review & meta-analysis|Cognitive task programming|Grant proposals" },
    { slug: "pharmaceutical-sciences", name: "Pharmaceutical Sciences", order: 18, description: "Drug discovery, pharmacokinetics, pharmacodynamics, formulation science, and regulatory affairs.", longDescription: "End-to-end pharmaceutical support from early-stage drug discovery to regulatory submission. CTD modules, IND/NDA filings, and clinical documentation.", icon: "Pill", tools: "Schrödinger, MOE, GastroPlus, Phoenix WinNonlin, SAS, R, LaTeX", servicesList: "Drug discovery & design|PK/PD modeling|Formulation development|Regulatory writing (CTD, IND, NDA, ANDA)|Clinical study reports|CMC documentation" },
    { slug: "sports-exercise", name: "Sports & Exercise Science", order: 19, description: "Exercise physiology, biomechanics, sports nutrition, strength & conditioning, and performance analysis.", longDescription: "Evidence-based sports science support from accredited practitioners. Lab report writing, data analysis, program design, and systematic reviews.", icon: "Heart", tools: "SPSS, R, Dartfish, Kinovea, Qualisys, ForceDecks, Excel, Python", servicesList: "Exercise physiology lab reports|Biomechanical analysis|Performance data analysis|Systematic reviews & meta-analyses|Training program design|Sports nutrition plans" },
    { slug: "energy-sustainability", name: "Energy & Sustainable Development", order: 20, description: "Renewable energy, energy efficiency, ESG reporting, carbon accounting, and sustainable infrastructure.", longDescription: "Technical and policy support for the energy transition. Solar, wind, hydrogen, storage, grid integration, and sustainability frameworks.", icon: "Leaf", tools: "HOMER, PVsyst, SAM, RETScreen, ArcGIS, OpenLCA, GaBi, Python", servicesList: "Renewable energy feasibility studies|Carbon footprint analysis|ESG & sustainability reporting|Energy modeling & simulation|Life cycle assessment|Policy briefs" },
    { slug: "materials-nanotechnology", name: "Materials Science & Nanotechnology", order: 21, description: "Nanomaterials, polymers, composites, thin films, characterization, and computational materials science.", longDescription: "From atomic-scale modelling to macroscopic property testing. Support for metals, ceramics, polymers, and advanced nanomaterials R&D.", icon: "Diamond", tools: "VASP, Quantum ESPRESSO, LAMMPS, Materials Studio, Origin, MATLAB, Python, SEM/TEM image analysis", servicesList: "DFT & molecular dynamics simulations|Materials characterization reports|Nanomaterial synthesis protocols|Composite design & testing|Grant & paper writing|Patent drafting" },
    { slug: "robotics-automation", name: "Robotics & Automation", order: 22, description: "Robotic systems, control theory, ROS, industrial automation, computer vision, and embedded systems.", longDescription: "Robotics engineering from concept to deployment. Perception, planning, control, and integration for industrial, service, and research platforms.", icon: "Atom", tools: "ROS/ROS2, Gazebo, OpenCV, PCL, MATLAB/Simulink, SolidWorks, Arduino, PLC, CODESYS", servicesList: "ROS development & simulation|Computer vision pipelines|Control system design|PLC & SCADA programming|Embedded systems|Technical documentation" },
  ];
  const disciplines = await Promise.all(disciplinesData.map((d) => prisma.discipline.create({ data: d })));
  console.log(`✓ ${disciplines.length} disciplines`);

  // --- Services (per-page pricing) ---
  const servicesData = [
    { slug: "academic-editing", name: "Academic Editing & Proofreading", category: "Editing & Proofreading", icon: "PenLine", order: 1, featured: true, description: "Line editing, copy-editing, and proofreading for academic papers, theses, journal articles, and dissertations. We work in APA, MLA, Chicago, Harvard, IEEE, and Vancouver styles.", shortDescription: "Professional line editing, copy-editing, and proofreading for academic work.", deliverables: "Tracked changes document, clean final version, style guide adherence report", pricePerPage: 6, minPages: 1, maxPages: 1000, pageUnit: "page", wordsPerPage: 250, turnaroundDays: 4, disciplineId: disciplines[0].id },
    { slug: "thesis-dissertation-editing", name: "Thesis & Dissertation Editing", category: "Editing & Proofreading", icon: "PenLine", order: 2, featured: true, description: "Comprehensive editing for theses and dissertations. We handle structural, line, and copy edits while preserving your voice and argument.", shortDescription: "Full structural + line editing for theses and dissertations.", deliverables: "Multi-pass edited document, supervisor-style comments, formatting check", pricePerPage: 12, minPages: 10, maxPages: 800, pageUnit: "page", wordsPerPage: 250, turnaroundDays: 7, disciplineId: disciplines[0].id },
    { slug: "research-paper-writing", name: "Research Paper Writing", category: "Academic Writing", icon: "PenLine", order: 3, description: "Full research paper writing from outline to publication-ready draft.", shortDescription: "End-to-end research paper writing with peer-review quality.", deliverables: "Outline, full draft, references, response to reviewers (1 round)", pricePerPage: 35, minPages: 5, maxPages: 60, pageUnit: "page", wordsPerPage: 250, turnaroundDays: 14, disciplineId: disciplines[0].id },
    { slug: "literature-review", name: "Literature Review", category: "Research Assistance", icon: "Microscope", order: 4, featured: true, description: "Comprehensive, structured literature reviews with proper citations, thematic synthesis, and identification of research gaps.", shortDescription: "Structured, citation-perfect literature review.", deliverables: "Annotated bibliography, thematic synthesis, gap analysis, reference list", pricePerPage: 25, minPages: 5, maxPages: 80, pageUnit: "page", wordsPerPage: 250, turnaroundDays: 10, disciplineId: disciplines[0].id },
    { slug: "statistical-analysis", name: "Statistical Analysis", category: "Data Analysis", icon: "Calculator", order: 5, featured: true, description: "Quantitative analysis in R, Python, SPSS, Stata. From data cleaning to publication-ready tables and figures.", shortDescription: "Quantitative analysis with reproducible code and figures.", deliverables: "Analysis script, output tables, publication-quality figures, methods write-up", pricePerPage: 30, minPages: 3, maxPages: 100, pageUnit: "page", wordsPerPage: 250, turnaroundDays: 7, disciplineId: disciplines[8].id },
    { slug: "data-visualization", name: "Data Visualization", category: "Data Analysis", icon: "Calculator", order: 6, description: "Publication-quality figures, interactive dashboards, and infographics.", shortDescription: "Publication-quality charts and interactive dashboards.", deliverables: "Source files (PNG/SVG/HTML), reproducible code, style guide", pricePerPage: 18, minPages: 1, maxPages: 50, pageUnit: "page", wordsPerPage: 250, turnaroundDays: 5, disciplineId: disciplines[8].id },
    { slug: "translation-academic", name: "Translation (Academic)", category: "Translation", icon: "Globe", order: 7, description: "Accurate, native-quality academic translation. ATA-certified translators with subject-matter expertise.", shortDescription: "Native, certified academic translation.", deliverables: "Translated document, certification of accuracy, glossary", pricePerPage: 14, minPages: 1, maxPages: 500, pageUnit: "page", wordsPerPage: 250, turnaroundDays: 5, disciplineId: disciplines[4].id },
    { slug: "translation-business", name: "Translation (Business)", category: "Translation", icon: "Globe", order: 8, description: "Business document translation: contracts, marketing materials, reports, presentations. 40+ language pairs.", shortDescription: "Business document translation across 40+ language pairs.", deliverables: "Translated document, terminology consistency check", pricePerPage: 12, minPages: 1, maxPages: 500, pageUnit: "page", wordsPerPage: 250, turnaroundDays: 4, disciplineId: disciplines[2].id },
    { slug: "translation-certified", name: "Certified Translation", category: "Translation", icon: "Globe", order: 9, description: "Certified translation for legal, immigration, and official use. Includes signed certificate of accuracy.", shortDescription: "Certified translation for official use with signed certificate.", deliverables: "Certified translation, signed certificate of accuracy", pricePerPage: 22, minPages: 1, maxPages: 100, pageUnit: "page", wordsPerPage: 250, turnaroundDays: 3, disciplineId: disciplines[5].id },
    { slug: "presentation-design", name: "Presentation Design", category: "Arts & Design", icon: "Sparkles", order: 10, description: "Pitch decks, conference talks, and academic presentations. Per-slide pricing for clarity.", shortDescription: "Per-slide pitch decks and presentation design.", deliverables: "Editable PowerPoint/Google Slides + PDF, speaker notes, source assets", pricePerPage: 12, minPages: 5, maxPages: 100, pageUnit: "slide", wordsPerPage: 100, turnaroundDays: 4, disciplineId: disciplines[6].id },
    { slug: "business-plan", name: "Business Plan Writing", category: "Business Plans & Reports", icon: "Briefcase", order: 11, description: "Investor-grade business plans: executive summary, market analysis, financial model, go-to-market.", shortDescription: "Investor-grade business plans with financial model.", deliverables: "Full business plan, financial model (XLSX), pitch deck (optional)", pricePerPage: 45, minPages: 15, maxPages: 80, pageUnit: "page", wordsPerPage: 250, turnaroundDays: 14, disciplineId: disciplines[2].id },
    { slug: "market-analysis", name: "Market Analysis & Sizing", category: "Business Plans & Reports", icon: "Briefcase", order: 12, description: "TAM/SAM/SOM analysis, competitive landscape, market entry strategy, customer segmentation.", shortDescription: "Market sizing and competitive analysis.", deliverables: "Market report, competitive matrix, strategic recommendations", pricePerPage: 38, minPages: 8, maxPages: 60, pageUnit: "page", wordsPerPage: 250, turnaroundDays: 10, disciplineId: disciplines[2].id },
    { slug: "case-study-analysis", name: "Case Study Analysis", category: "Business Plans & Reports", icon: "Briefcase", order: 13, description: "Business school case study analysis with structured frameworks, financial breakdowns, and recommendations.", shortDescription: "Structured business school case analyses.", deliverables: "Case write-up, exhibits, executive summary", pricePerPage: 16, minPages: 5, maxPages: 40, pageUnit: "page", wordsPerPage: 250, turnaroundDays: 6, disciplineId: disciplines[2].id },
    { slug: "code-review", name: "Code Review", category: "Software Development", icon: "Code2", order: 14, description: "Thorough code review with security, performance, and maintainability feedback. Per thousand lines of code (TLOC).", shortDescription: "Per-TLOC security, performance, and maintainability review.", deliverables: "Annotated PR, review report, prioritized recommendations", pricePerPage: 22, minPages: 1, maxPages: 100, pageUnit: "sheet", wordsPerPage: 100, turnaroundDays: 3, disciplineId: disciplines[3].id },
    { slug: "web-development", name: "Web Development", category: "Software Development", icon: "Code2", order: 15, description: "Custom web development: landing pages, dashboards, full-stack apps. Modern stack: Next.js, React, TypeScript, Node, PostgreSQL.", shortDescription: "Per-page web development in modern stacks.", deliverables: "Source code, deployment, documentation, 30 days bug-fix support", pricePerPage: 180, minPages: 1, maxPages: 30, pageUnit: "page", wordsPerPage: 250, turnaroundDays: 10, disciplineId: disciplines[3].id },
    { slug: "tutoring-session", name: "1-on-1 Tutoring Session", category: "Tutoring & Coaching", icon: "Users", order: 16, description: "Personalized 1-on-1 tutoring in math, statistics, programming, languages, and standardized tests. Per-hour billing.", shortDescription: "Per-hour personalized tutoring.", deliverables: "Session recording, practice problems, follow-up notes", pricePerPage: 60, minPages: 1, maxPages: 20, pageUnit: "hour", wordsPerPage: 60, turnaroundDays: 1, disciplineId: disciplines[7].id },
    { slug: "engineering-design", name: "Engineering Design & CAD", category: "Engineering Design", icon: "Wrench", order: 17, description: "CAD modeling, FEA analysis, GD&T, BOM creation. Per-sheet pricing for clarity.", shortDescription: "CAD and FEA work, priced per drawing sheet.", deliverables: "Source CAD files, renders, analysis report", pricePerPage: 85, minPages: 1, maxPages: 50, pageUnit: "sheet", wordsPerPage: 250, turnaroundDays: 7, disciplineId: disciplines[0].id },
    { slug: "architecture-drawing", name: "Architectural Drawings", category: "Engineering Design", icon: "Wrench", order: 18, description: "Architectural plans, sections, elevations, BIM models. Per-sheet pricing.", shortDescription: "Architectural drawings and BIM models, per sheet.", deliverables: "DWG/Revit files, PDF set, renderings", pricePerPage: 110, minPages: 1, maxPages: 80, pageUnit: "sheet", wordsPerPage: 250, turnaroundDays: 10, disciplineId: disciplines[11].id },
    { slug: "legal-memo", name: "Legal Memorandum", category: "Custom Project", icon: "Award", order: 19, description: "IRAC/CREAC legal memos, case briefs, statutory analysis, contract review.", shortDescription: "IRAC/CREAC legal memoranda and case briefs.", deliverables: "Memo document, citations table, executive summary", pricePerPage: 28, minPages: 3, maxPages: 50, pageUnit: "page", wordsPerPage: 250, turnaroundDays: 7, disciplineId: disciplines[5].id },
    { slug: "policy-brief", name: "Policy Brief", category: "Custom Project", icon: "Award", order: 20, description: "Concise, evidence-based policy briefs for government, NGOs, and advocacy organizations.", shortDescription: "Evidence-based policy briefs.", deliverables: "Policy brief, evidence summary, recommendations", pricePerPage: 32, minPages: 4, maxPages: 30, pageUnit: "page", wordsPerPage: 250, turnaroundDays: 8, disciplineId: disciplines[5].id },
  ];
  const services = await Promise.all(servicesData.map((s) => prisma.service.create({ data: s })));
  console.log(`✓ ${services.length} services`);

  // --- Pricing tiers ---
  const tiersData = [
    { name: "Starter", slug: "starter", blurb: "Perfect for quick tasks, formatting fixes, short edits, single-question help.", pricePerPage: 8, minPages: 1, includedPages: 3, features: "Best for 1-10 page tasks|Standard turnaround (5-7 days)|Email support|Single revision|Trusted expert network", ctaLabel: "Get started", order: 1, featured: false },
    { name: "Professional", slug: "professional", blurb: "Our most popular tier, research, analysis, multi-page writing, code reviews.", pricePerPage: 18, minPages: 5, includedPages: 15, features: "Best for 10-50 page tasks|Priority turnaround (3-5 days)|Direct messaging with expert|Up to 2 revision rounds|14-day revision window|Money-back guarantee", ctaLabel: "Get started", order: 2, featured: true },
    { name: "Enterprise", slug: "enterprise", blurb: "Custom projects, long-term collaborations, and team-wide engagements.", pricePerPage: 35, minPages: 20, includedPages: 50, features: "Best for 50+ page projects|Dedicated account manager|Express turnaround (1–3 days)|Unlimited revisions|NDA & IP assignment|24/7 priority support|Milestone-based billing", ctaLabel: "Contact sales", ctaHref: "/contact", order: 3, featured: false },
  ];
  await Promise.all(tiersData.map((t) => prisma.pricingTier.create({ data: t })));
  console.log(`✓ ${tiersData.length} pricing tiers`);

  // --- Academic Levels ---
  const academicLevelsData = [
    {
      slug: "high-school",
      name: "High School",
      description: "Standard high school courses, AP/IB level work, college prep assignments",
      order: 1,
    },
    {
      slug: "college",
      name: "College (Associate & Certificate)",
      description: "Community college, associate degrees, certificate programs, vocational training",
      order: 2,
    },
    {
      slug: "undergraduate",
      name: "Undergraduate (Bachelor's)",
      description: "Bachelor's degree coursework, capstone projects, honors theses",
      order: 3,
    },
    {
      slug: "masters",
      name: "Master's Degrees",
      description: "MA, MSc, MRes, MPhil, MEd, MES, MBA, MPA, MPH, MEng, MTech, MArch, MFin, MAcc, MCom, MPP, MFA, MMus, MLIS, MSW, MPlan, MDes, MStat, MMath, LLM, MAgr, MClinRes",
      order: 4,
    },
    {
      slug: "doctoral",
      name: "Doctoral Degrees",
      description: "PhD, DBA, EdD, DNP, DrPH, DEng, EngD, DSc, ScD, DM, PsyD, PharmD, JD, DMus, DPhil",
      order: 5,
    },
    {
      slug: "research",
      name: "Research Degrees",
      description: "MRes, MPhil, PhD, DPhil, DSc, ScD, DLitt, LittD",
      order: 6,
    },
    {
      slug: "professional",
      name: "Professional Research Programmes",
      description: "Postgraduate Diploma (PGDip), Postgraduate Certificate (PGCert), Graduate Diploma, Graduate Certificate",
      order: 7,
    },
  ];
  const academicLevels = await Promise.all(
    academicLevelsData.map((l) => prisma.academicLevel.create({ data: l }))
  );
  console.log(`✓ ${academicLevels.length} academic levels`);

  // --- Subjects (from the comprehensive academic catalog) ---
  const { ACADEMIC_SUBJECTS } = await import("../lib/academic-catalog");
  let subjectOrder = 0;
  for (const s of ACADEMIC_SUBJECTS) {
    await prisma.subject.upsert({
      where: { name_levelSlug: { name: s.name, levelSlug: s.level } },
      create: {
        name: s.name,
        levelSlug: s.level,
        department: s.department,
        courseCode: s.courseCode,
        description: s.description,
        priceMultiplier: s.priceMultiplier,
        institutions: JSON.stringify(s.institutions),
        order: subjectOrder++,
        active: true,
      },
      update: {
        department: s.department,
        courseCode: s.courseCode,
        description: s.description,
        priceMultiplier: s.priceMultiplier,
        institutions: JSON.stringify(s.institutions),
      },
    });
  }
  const subjectCount = await prisma.subject.count();
  console.log(`✓ ${subjectCount} subjects`);

  // --- Subjects per level (for subject-based pricing) ---
  // Different subjects within a level have different complexity, hence different multipliers.
  // Stored in a constant and used by the price calculator.
  const subjectMultipliers: Record<string, Record<string, number>> = {
    "high-school": {
      "Mathematics": 0.9,
      "Sciences (Biology, Chemistry, Physics)": 0.95,
      "English / Literature": 0.85,
      "History / Social Studies": 0.85,
      "Foreign Languages": 0.9,
      "Computer Science / IT": 1.0,
      "Arts / Music / Design": 0.9,
      "AP / IB / Honors": 1.1,
    },
    "college": {
      "Mathematics / Statistics": 1.0,
      "Sciences (Biology, Chemistry, Physics)": 1.0,
      "English / Humanities": 0.9,
      "Business / Accounting": 1.0,
      "Computer Science / IT": 1.05,
      "Engineering / Technical": 1.1,
      "Nursing / Health Sciences": 1.1,
      "Arts / Design / Music": 0.95,
    },
    "undergraduate": {
      "Mathematics / Statistics": 1.0,
      "Sciences (Biology, Chemistry, Physics)": 1.05,
      "Humanities (English, History, Philosophy)": 0.95,
      "Business / Economics / Finance": 1.0,
      "Computer Science / IT": 1.1,
      "Engineering (Mechanical, Civil, Electrical)": 1.15,
      "Social Sciences (Psychology, Sociology)": 0.95,
      "Arts / Design / Architecture": 1.0,
      "Law / Pre-law": 1.1,
      "Medicine / Pre-med / Nursing": 1.15,
    },
    "masters": {
      "STEM (Math, Physics, Engineering)": 1.0,
      "Life Sciences (Biology, Chemistry)": 1.0,
      "Humanities (English, History, Philosophy)": 0.95,
      "Business / MBA / Finance": 1.0,
      "Computer Science / Data Science": 1.05,
      "Law / LLM": 1.05,
      "Medicine / Public Health / Nursing": 1.1,
      "Arts / Design / Architecture / Music": 1.0,
    },
    "doctoral": {
      "STEM (Math, Physics, Engineering)": 1.0,
      "Life Sciences (Biology, Chemistry)": 1.0,
      "Humanities (English, History, Philosophy)": 0.95,
      "Business / DBA / Finance": 1.0,
      "Computer Science / Data Science": 1.05,
      "Law / JD": 1.05,
      "Medicine / PharmD / Public Health": 1.1,
      "Psychology / PsyD": 1.0,
      "Education / EdD": 0.95,
    },
    "research": {
      "STEM Research": 1.0,
      "Life Sciences Research": 1.0,
      "Humanities Research": 0.95,
      "Social Sciences Research": 0.95,
    },
    "professional": {
      "Postgraduate Diploma": 1.0,
      "Postgraduate Certificate": 1.0,
      "Graduate Diploma": 1.0,
      "Graduate Certificate": 1.0,
    },
  };

  // --- Service academic pricing (per level) ---
  const levelMultipliers: Record<string, number> = {
    "high-school": 0.5,
    "college": 0.7,
    "undergraduate": 0.85,
    "masters": 1.0,
    "doctoral": 1.5,
    "research": 1.3,
    "professional": 1.2,
  };
  const servicePricesData = [];
  for (const service of services) {
    for (const level of academicLevels) {
      servicePricesData.push({
        serviceId: service.id,
        academicLevelId: level.id,
        pricePerPage: Math.round(service.pricePerPage * levelMultipliers[level.slug] * 100) / 100,
        wordsPerPage: service.wordsPerPage,
        minPages: service.minPages,
        rushMultiplier: 1.5,
      });
    }
  }
  await Promise.all(
    servicePricesData.map((p) => prisma.serviceAcademicPrice.create({ data: p }))
  );
  console.log(`✓ ${servicePricesData.length} service academic prices`);

  // --- Testimonials ---
  const testimonialsData = [
    { name: "Dr. Amara Okafor", role: "PhD Researcher", country: "United Kingdom", quote: "My statistical analysis was stuck for weeks. AssistBridge matched me with a biostatistician who turned it around in 4 days. Publication-ready.", rating: 5, avatarSeed: 11, order: 1 },
    { name: "Marcus Lindgren", role: "Startup Founder", country: "Sweden", quote: "We needed a quick MVP for an investor pitch. Their full-stack expert delivered a working demo in 10 days. Saved us a hiring cycle.", rating: 5, avatarSeed: 12, order: 2 },
    { name: "Yuki Tanaka", role: "Master's Student", country: "Australia", quote: "Thesis editing and APA formatting. My expert caught inconsistencies I'd missed in twenty drafts. Worth every dollar.", rating: 5, avatarSeed: 13, order: 3 },
    { name: "Sofia Restrepo", role: "Public Health Consultant", country: "Colombia", quote: "The systematic review was comprehensive and the methodology section passed peer review with no revisions. Exceptional work.", rating: 5, avatarSeed: 14, order: 4 },
    { name: "Hiroshi Yamamoto", role: "Engineering Manager", country: "Japan", quote: "We use AssistBridge for ongoing FEA and CAD support. The quality is consistent and the turnaround beats any agency we've tried.", rating: 5, avatarSeed: 15, order: 5 },
    { name: "Elena Petrova", role: "Marketing Director", country: "Germany", quote: "The market analysis they delivered was deeper than what our $30K agency produced. Half the cost, twice the insight.", rating: 5, avatarSeed: 16, order: 6 },
  ];
  await Promise.all(testimonialsData.map((t) => prisma.testimonial.create({ data: t })));
  console.log(`✓ ${testimonialsData.length} testimonials`);

  // --- Team ---
  const teamData = [
    { name: "Patty Wafula", role: "Founder & CEO", bio: "Researcher-turned-operator with a passion for connecting talent to opportunity. Founded AssistBridge after watching brilliant researchers struggle to find reliable expert help.", avatarSeed: 17, order: 1 },
    { name: "Alex Morgan", role: "Head of Operations", bio: "Runs expert vetting and quality. Former academic program manager with a passion for process and a low tolerance for sloppy work.", avatarSeed: 18, order: 2 },
    { name: "Priya Shah", role: "Head of Engineering", bio: "Builds the platform. Believes good UX is a feature, not a luxury. Previously shipped fintech and edtech products.", avatarSeed: 19, order: 3 },
    { name: "Diego Ramirez", role: "Head of Expert Success", bio: "Onboards and supports our global expert network across 60+ countries. Speaks five languages and counting.", avatarSeed: 20, order: 4 },
  ];
  await Promise.all(teamData.map((m) => prisma.teamMember.create({ data: m })));
  console.log(`✓ ${teamData.length} team members`);

  // --- FAQ ---
  const faqData = [
    { category: "General", order: 1, question: "What is AssistBridge?", answer: "AssistBridge is a platform that connects clients worldwide with vetted experts for research, technical, and academic assistance across every major discipline. We process payments securely through Stripe and PayPal, and we mediate disputes to ensure quality on both sides." },
    { category: "General", order: 2, question: "Where are you based?", answer: "AssistBridge LLC operates remotely with team members across multiple continents. We serve clients in 60+ countries." },
    { category: "General", order: 3, question: "How do I get started?", answer: "Create a free account, then submit a request describing your task. We'll match you with a vetted expert and provide a transparent per-page quote within 24 hours." },
    { category: "Pricing", order: 1, question: "How is the price calculated?", answer: "Most of our services are priced per page (250 words), slide, sheet, or hour, depending on the work. You see the exact price before paying. Rush delivery and add-ons are quoted separately." },
    { category: "Pricing", order: 2, question: "How do I pay?", answer: "You pay AssistBridge through Stripe or PayPal when you accept a quote. We hold the payment until you approve the work, then release it to the expert. We never see or store your card details." },
    { category: "Pricing", order: 3, question: "Are there hidden fees?", answer: "No. We add a 15% platform fee to the expert's rate, which is shown in your quote. There are no subscription fees, listing fees, or surprise charges." },
    { category: "Pricing", order: 4, question: "Do you offer refunds?", answer: "Yes. If the delivered work doesn't meet the agreed scope, you can request revisions within 14 days. If unresolved, our dispute team will mediate and issue a refund where appropriate." },
    { category: "Pricing", order: 5, question: "Do you offer student or non-profit discounts?", answer: "Yes. Verified students and registered non-profits receive a 10% discount. Contact us with your ID to enable it." },
    { category: "Payments", order: 1, question: "Which payment methods do you accept?", answer: "We accept all major credit and debit cards (via Stripe), Apple Pay, Google Pay, and PayPal. Local payment methods like iDEAL, SEPA, and BACS are supported where available." },
    { category: "Payments", order: 2, question: "Is my payment information secure?", answer: "Yes. All payment data is handled by Stripe and PayPal, both PCI-DSS Level 1 certified. We never see or store your card details." },
    { category: "Payments", order: 3, question: "Can I get an invoice?", answer: "Yes. Invoices are automatically generated and emailed for every payment. Your dashboard stores your complete payment history." },
    { category: "Experts", order: 1, question: "How are experts vetted?", answer: "Every expert goes through a multi-step process: identity verification, credential check, sample task evaluation, and a trial period. Only the top ~12% of applicants are accepted." },
    { category: "Experts", order: 2, question: "Can I choose my expert?", answer: "Yes. With every match, we share the expert's profile, ratings, and a sample of their work. You can request a different expert before approving the quote." },
    { category: "Experts", order: 3, question: "How do experts get paid?", answer: "When you approve the final delivery, funds are released to the expert minus the 15% platform fee. Payouts are processed weekly via Stripe or PayPal." },
    { category: "Process", order: 1, question: "How long does matching take?", answer: "Most clients are matched within 4–24 hours. Complex or specialized tasks may take slightly longer." },
    { category: "Process", order: 2, question: "What does a \"page\" mean?", answer: "By default, one page = 250 words of double-spaced text, or one slide, one drawing sheet, or one hour of tutoring. The unit is shown on every service." },
    { category: "Process", order: 3, question: "Can I message my expert?", answer: "Yes. Our in-platform messaging supports text and attachments. All communication stays on the platform for quality and safety." },
    { category: "Process", order: 4, question: "What if I need revisions?", answer: "You have a 14-day revision window after delivery. Submit revision requests through your order page and your expert will respond." },
    { category: "Process", order: 5, question: "Can experts sign an NDA?", answer: "On request. Let us know in your brief and we'll arrange an NDA before work begins." },
  ];
  await Promise.all(faqData.map((f) => prisma.faq.create({ data: f })));
  console.log(`✓ ${faqData.length} FAQ entries`);

  // --- Blog posts ---
  const blogData = [
    { slug: "choose-right-research-methodology", title: "How to Choose the Right Research Methodology for Your Project", excerpt: "A practical framework for selecting between qualitative, quantitative, and mixed-methods approaches.", body: "Choosing a research methodology is one of the most consequential decisions you'll make on any project. It shapes what data you collect, how you analyze it, and what claims you can reasonably make. There are three broad families of research methods: qualitative, quantitative, and mixed methods. Use quantitative methods when you have a clearly defined research question. Use qualitative methods when your question is exploratory. Use mixed methods when your question benefits from both. The key is to start from your research question, not from a method you happen to know.", category: "Research", readTime: "8 min", image: "https://picsum.photos/seed/research1/1200/600", published: true, publishedAt: new Date("2025-08-12") },
    { slug: "writing-strong-thesis", title: "5 Tips for Writing a Thesis Your Committee Will Actually Approve", excerpt: "Common pitfalls graduate students face and how to avoid them.", body: "Writing a thesis is a marathon, not a sprint. First, write the introduction last. Second, make your argument visible. Third, cite deliberately. Fourth, write for your reader, not for yourself. Fifth, get feedback early and often.", category: "Academic", readTime: "6 min", image: "https://picsum.photos/seed/thesis1/1200/600", published: true, publishedAt: new Date("2025-09-04") },
    { slug: "statistics-software-comparison", title: "R vs Python vs SPSS: Which Statistical Software Should You Use?", excerpt: "An honest comparison based on your goals.", body: "SPSS is the easiest to learn. R is the most powerful for statistics. Python is the most versatile. For a quick class project: SPSS. For a thesis with a methods chapter: R. For an industry role or ML-heavy work: Python.", category: "Data", readTime: "10 min", image: "https://picsum.photos/seed/stats1/1200/600", published: true, publishedAt: new Date("2025-09-22") },
    { slug: "outsourcing-research-ethically", title: "Outsourcing Research Assistance: What's Ethical and What's Not", excerpt: "Universities have different rules. Here's how to navigate them.", body: "Most universities explicitly permit: tutoring, editing, formatting, statistical consulting, language translation, and clarification of concepts. Most prohibit: submitting someone else's work as your own, completing graded assignments, or generating entire papers for submission.", category: "Guides", readTime: "7 min", image: "https://picsum.photos/seed/ethics1/1200/600", published: true, publishedAt: new Date("2025-10-08") },
    { slug: "mlm-survey-design", title: "Designing Surveys for Multilevel Modeling: A Practical Guide", excerpt: "Sample size, ICC, design effects, what you need to know.", body: "Multilevel modeling handles nested data. The key concepts are the intraclass correlation coefficient and the design effect. If you're designing from scratch, you need enough groups (typically 30+) and enough individuals per group (typically 5-30).", category: "Research", readTime: "9 min", image: "https://picsum.photos/seed/survey1/1200/600", published: true, publishedAt: new Date("2025-10-25") },
    { slug: "freelancer-vs-agency", title: "Why We Built AssistBridge: The Case Against the Agency Model", excerpt: "Agencies take 40–60% cuts. Freelancing platforms gamble on quality.", body: "We wanted a third option: curated experts at freelance prices, with the project management and quality control of an agency. So we built it. Every expert is interviewed, credential-checked, and trial-reviewed before joining.", category: "Company", readTime: "5 min", image: "https://picsum.photos/seed/company1/1200/600", published: true, publishedAt: new Date("2025-11-02") },
  ];
  await Promise.all(blogData.map((b) => prisma.blogPost.create({ data: b })));
  console.log(`✓ ${blogData.length} blog posts`);

  // --- Site stats ---
  const statsData = [
    { label: "disciplines", value: "12", order: 1 },
    { label: "experts", value: "250+", order: 2 },
    { label: "tasks", value: "1,200+", order: 3 },
    { label: "countries", value: "60+", order: 4 },
  ];
  await Promise.all(statsData.map((s) => prisma.siteStat.create({ data: s })));
  console.log(`✓ ${statsData.length} site stats`);

  // --- Demo users ---
  const adminPassword = await bcrypt.hash("admin123", 10);
  const clientPassword = await bcrypt.hash("demo1234", 10);
  const admin = await prisma.user.create({
    data: {
      email: "patywafula2019@gmail.com",
      name: "Patty Wafula",
      role: "ADMIN",
      hashedPassword: adminPassword,
      emailVerified: new Date(),
    },
  });
  const client = await prisma.user.create({
    data: {
      email: "client@demo.com",
      name: "Alex Morgan",
      role: "CLIENT",
      hashedPassword: clientPassword,
      emailVerified: new Date(),
      clientProfile: {
        create: {
          country: "United States",
          company: "Acme Inc.",
          photoSeed: 25,
        },
      },
    },
  });

  const expertData = [
    { email: "sarah@demo.com", name: "Dr. Sarah Chen", headline: "Biostatistician · PhD", country: "Singapore", rate: 95, expertise: "Mathematics & Statistics,Medicine & Health" },
    { email: "james@demo.com", name: "James O'Brien", headline: "Full-stack engineer", country: "Ireland", rate: 80, expertise: "Technology & Computing" },
    { email: "aisha@demo.com", name: "Aisha Mwangi", headline: "Economist · MA Oxford", country: "Kenya", rate: 65, expertise: "Business & Finance,Humanities & Social Sciences" },
    { email: "marco@demo.com", name: "Marco Rossi", headline: "Mechanical engineer", country: "Italy", rate: 70, expertise: "Science & Engineering" },
  ];
  const experts = [];
  for (const e of expertData) {
    const exp = await prisma.user.create({
      data: {
        email: e.email,
        name: e.name,
        role: "EXPERT",
        hashedPassword: clientPassword,
        emailVerified: new Date(),
        expertProfile: { create: { headline: e.headline, bio: `Experienced ${e.headline} with 8+ years of professional work.`, hourlyRate: e.rate, currency: "USD", expertise: e.expertise, languages: "English", yearsExp: 8, status: "VERIFIED", rating: 4.5 + Math.random() * 0.5, completedJobs: Math.floor(20 + Math.random() * 100) } },
      },
    });
    experts.push(exp);
  }
  console.log(`✓ ${experts.length} demo experts + 1 admin + 1 client`);

  // --- Sample orders for the demo client ---
  const orderData = [
    { title: "Statistical analysis for climate paper", status: "IN_PROGRESS", expert: experts[0], service: services[4], pages: 12, amount: 360, brief: "Comprehensive statistical analysis of climate data from 1990-2024, focusing on temperature anomalies with regression, trend analysis, and publication-quality visualizations." },
    { title: "Thesis chapter 3: methodology rewrite", status: "DELIVERED", expert: experts[2], service: services[1], pages: 25, amount: 300, brief: "Rewrite of chapter 3 for doctoral thesis, focused on methodology section. Needs academic tone, proper citations, and clearer logical structure." },
    { title: "React dashboard MVP", status: "COMPLETED", expert: experts[1], service: services[14], pages: 8, amount: 1440, brief: "Build an MVP dashboard for a SaaS analytics product. User auth, charts, real-time data, deployment to Vercel." },
    { title: "Market analysis for SaaS expansion", status: "COMPLETED", expert: experts[2], service: services[11], pages: 22, amount: 836, brief: "TAM/SAM/SOM analysis for expanding our SaaS product into the European market. Needs competitive landscape and pricing analysis." },
    { title: "FEA analysis of bridge component", status: "CANCELLED", expert: experts[3], service: services[16], pages: 6, amount: 510, brief: "Finite element analysis of a steel bridge component under various load conditions. Need stress and deformation plots." },
    { title: "Literature review on AI ethics", status: "QUOTED", expert: experts[0], service: services[3], pages: 15, amount: 375, brief: "Structured literature review on the ethics of generative AI in healthcare. 40+ peer-reviewed sources, thematic synthesis, gap analysis." },
  ];
  for (const o of orderData) {
    const order = await prisma.order.create({
      data: {
        title: o.title,
        brief: o.brief,
        clientId: client.id,
        expertId: o.expert.id,
        serviceId: o.service.id,
        pageCount: o.pages,
        status: o.status,
        finalPrice: o.amount,
        quotedPrice: o.amount,
        deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        deadlineType: Math.random() > 0.7 ? "urgent" : "standard",
        academicLevelId: academicLevels[Math.floor(Math.random() * academicLevels.length)].id,
        subject: "General",
        currency: "USD",
      },
    });
    await prisma.message.createMany({
      data: [
        { orderId: order.id, fromUserId: client.id, body: "Looking forward to working with you on this. I've attached the brief and any reference materials." },
        { orderId: order.id, fromUserId: o.expert.id, body: "Thanks! I've reviewed the brief and have a clear plan. I'll send a first draft within a few days." },
        { orderId: order.id, fromUserId: client.id, body: "Sounds great. Let me know if you have any clarifying questions." },
      ],
    });
    if (o.status === "COMPLETED") {
      await prisma.payment.create({ data: { orderId: order.id, gateway: "STRIPE", amount: o.amount, status: "RELEASED", gatewayRef: "pi_demo_" + Math.random().toString(36).slice(2, 10) } });
      await prisma.review.create({ data: { orderId: order.id, fromUserId: client.id, toUserId: o.expert.id, rating: 5, comment: "Excellent work. Delivered on time and exceeded expectations." } });
    } else if (o.status === "DELIVERED" || o.status === "IN_PROGRESS") {
      await prisma.payment.create({ data: { orderId: order.id, gateway: "STRIPE", amount: o.amount, status: "SUCCEEDED", gatewayRef: "pi_demo_" + Math.random().toString(36).slice(2, 10) } });
    }
  }
  console.log(`✓ ${orderData.length} sample orders`);

  await prisma.contactSubmission.createMany({
    data: [
      { name: "Sarah Johnson", email: "sarah.j@example.com", subject: "Enterprise inquiry", message: "We're a team of 50 looking for ongoing research support." },
      { name: "Michael Chen", email: "mchen@example.com", subject: "Partnership opportunity", message: "I'd like to discuss a partnership." },
    ],
  });
  await prisma.expertApplication.createMany({
    data: [
      { name: "Maria Lopez", email: "maria.lopez@example.com", expertise: "Arts & Design", bio: "MFA from Parsons.", hourlyRate: 50, currency: "USD" },
      { name: "Kenji Park", email: "kenji.p@example.com", expertise: "Technology & Computing", bio: "Senior ML engineer.", hourlyRate: 85, currency: "USD" },
    ],
  });

  console.log("\n✅ Demo seed complete.\n");
  console.log("Login credentials:");
  console.log("  Admin:   patywafula2019@gmail.com / admin123");
  console.log("  Client:  client@demo.com / demo1234");
  console.log("  Expert:  sarah@demo.com / demo1234");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
