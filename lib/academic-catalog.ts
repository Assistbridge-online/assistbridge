// Comprehensive academic subjects catalog with institution context.
// Each subject is mapped to the academic level it appears at, the
// department / school it usually lives in, a representative course code,
// and the kinds of institutions that teach it. Used by the /api/subjects
// endpoint and the price calculator.

export type AcademicLevelSlug =
  | "high-school"
  | "college"
  | "undergraduate"
  | "masters"
  | "doctoral"
  | "research"
  | "professional";

export interface InstitutionExample {
  name: string;
  country: string;
}

export interface AcademicSubject {
  name: string;
  level: AcademicLevelSlug;
  department: string;
  courseCode: string;
  description: string;
  institutions: InstitutionExample[];
  priceMultiplier: number;
}

// Per-level base multipliers
export const LEVEL_BASE_MULTIPLIERS: Record<AcademicLevelSlug, number> = {
  "high-school": 0.5,
  "college": 0.7,
  "undergraduate": 0.85,
  "masters": 1.0,
  "doctoral": 1.5,
  "research": 1.3,
  "professional": 1.2,
};

// A small set of representative institutions used to give the catalog
// realistic context. These are widely recognised, internationally known
// schools grouped by region.
const institutions = {
  us: [
    { name: "Massachusetts Institute of Technology", country: "USA" },
    { name: "Stanford University", country: "USA" },
    { name: "Harvard University", country: "USA" },
    { name: "University of California, Berkeley", country: "USA" },
    { name: "Princeton University", country: "USA" },
    { name: "Yale University", country: "USA" },
    { name: "Columbia University", country: "USA" },
    { name: "New York University", country: "USA" },
  ],
  uk: [
    { name: "University of Oxford", country: "UK" },
    { name: "University of Cambridge", country: "UK" },
    { name: "Imperial College London", country: "UK" },
    { name: "London School of Economics", country: "UK" },
    { name: "University of Edinburgh", country: "UK" },
  ],
  eu: [
    { name: "ETH Zurich", country: "Switzerland" },
    { name: "EPFL", country: "Switzerland" },
    { name: "TU Munich", country: "Germany" },
    { name: "Sorbonne University", country: "France" },
    { name: "University of Amsterdam", country: "Netherlands" },
  ],
  asia: [
    { name: "National University of Singapore", country: "Singapore" },
    { name: "Tsinghua University", country: "China" },
    { name: "University of Tokyo", country: "Japan" },
    { name: "Indian Institute of Technology, Bombay", country: "India" },
  ],
  other: [
    { name: "University of Toronto", country: "Canada" },
    { name: "University of Melbourne", country: "Australia" },
    { name: "University of Cape Town", country: "South Africa" },
  ],
};

const inst = (...regions: (keyof typeof institutions)[]) =>
  regions.flatMap((r) => institutions[r]);

// The catalog. Each entry is a subject that exists at the given level.
// Multipliers vary by subject complexity and specialization.
export const ACADEMIC_SUBJECTS: AcademicSubject[] = [
  // ─── HIGH SCHOOL ─────────────────────────────────────────────────
  { name: "Algebra I", level: "high-school", department: "Mathematics", courseCode: "MATH-101", description: "Linear equations, inequalities, polynomials, factoring, quadratics, and functions.", institutions: inst("us", "uk"), priceMultiplier: 0.85 },
  { name: "Algebra II", level: "high-school", department: "Mathematics", courseCode: "MATH-201", description: "Functions, polynomials, logarithms, trigonometry, sequences, and probability.", institutions: inst("us", "uk"), priceMultiplier: 0.9 },
  { name: "Geometry", level: "high-school", department: "Mathematics", courseCode: "MATH-110", description: "Points, lines, planes, angles, congruence, similarity, circles, and proofs.", institutions: inst("us", "uk", "eu"), priceMultiplier: 0.85 },
  { name: "Pre-Calculus", level: "high-school", department: "Mathematics", courseCode: "MATH-150", description: "Functions, trigonometry, analytic geometry, and limits as a precursor to calculus.", institutions: inst("us", "uk"), priceMultiplier: 0.9 },
  { name: "Calculus AB (AP)", level: "high-school", department: "Mathematics", courseCode: "AP-CALC-AB", description: "Limits, derivatives, integrals, and the Fundamental Theorem of Calculus at AP level.", institutions: inst("us"), priceMultiplier: 1.1 },
  { name: "Calculus BC (AP)", level: "high-school", department: "Mathematics", courseCode: "AP-CALC-BC", description: "AP Calculus BC: series, polar, parametric, and advanced integration techniques.", institutions: inst("us"), priceMultiplier: 1.15 },
  { name: "Statistics (AP)", level: "high-school", department: "Mathematics", courseCode: "AP-STAT", description: "Exploring data, sampling, probability, inference, and regression at AP level.", institutions: inst("us"), priceMultiplier: 1.05 },
  { name: "Biology (AP)", level: "high-school", department: "Sciences", courseCode: "AP-BIO", description: "Cells, heredity, evolution, organisms, and ecology at the AP level.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.05 },
  { name: "Chemistry (AP)", level: "high-school", department: "Sciences", courseCode: "AP-CHEM", description: "Atomic structure, bonding, reactions, kinetics, thermodynamics, and equilibrium.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.05 },
  { name: "Physics (AP)", level: "high-school", department: "Sciences", courseCode: "AP-PHYS", description: "Mechanics, electricity, waves, and modern physics at the AP level.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.05 },
  { name: "English Literature", level: "high-school", department: "Humanities", courseCode: "ENG-200", description: "Poetry, prose, drama, literary analysis, and essay writing.", institutions: inst("us", "uk"), priceMultiplier: 0.8 },
  { name: "World History", level: "high-school", department: "Humanities", courseCode: "HIST-100", description: "Global historical events, civilizations, and cultural developments.", institutions: inst("us", "uk", "eu"), priceMultiplier: 0.8 },
  { name: "U.S. History (AP)", level: "high-school", department: "Humanities", courseCode: "AP-USHIST", description: "AP U.S. History: political, economic, and social developments from 1491 to present.", institutions: inst("us"), priceMultiplier: 0.95 },
  { name: "Spanish", level: "high-school", department: "Foreign Languages", courseCode: "SPAN-100", description: "Spanish language: grammar, vocabulary, reading, and conversation.", institutions: inst("us", "uk", "eu", "other"), priceMultiplier: 0.85 },
  { name: "French", level: "high-school", department: "Foreign Languages", courseCode: "FREN-100", description: "French language: grammar, vocabulary, reading, and conversation.", institutions: inst("us", "uk", "eu", "other"), priceMultiplier: 0.85 },
  { name: "Computer Science Principles (AP)", level: "high-school", department: "Computer Science", courseCode: "AP-CSP", description: "AP CSP: programming, data, the internet, and the impact of computing.", institutions: inst("us"), priceMultiplier: 1.0 },
  { name: "Art & Design", level: "high-school", department: "Arts", courseCode: "ART-100", description: "Drawing, painting, design principles, and art history.", institutions: inst("us", "uk", "eu"), priceMultiplier: 0.9 },

  // ─── COLLEGE (Associate & Certificate) ──────────────────────────
  { name: "College Algebra", level: "college", department: "Mathematics", courseCode: "MATH-1314", description: "Quadratic equations, polynomial and rational functions, logarithms, and systems.", institutions: inst("us"), priceMultiplier: 0.95 },
  { name: "Introductory Statistics", level: "college", department: "Mathematics", courseCode: "MATH-1342", description: "Descriptive statistics, probability, distributions, hypothesis testing, and regression.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.0 },
  { name: "English Composition I", level: "college", department: "English", courseCode: "ENGL-1301", description: "Rhetorical analysis, argumentation, and the writing process.", institutions: inst("us"), priceMultiplier: 0.85 },
  { name: "English Composition II", level: "college", department: "English", courseCode: "ENGL-1302", description: "Researched argument, critical reading, and source-based writing.", institutions: inst("us"), priceMultiplier: 0.9 },
  { name: "Introductory Biology", level: "college", department: "Biology", courseCode: "BIOL-1408", description: "Cell structure, metabolism, genetics, evolution, and ecology.", institutions: inst("us", "uk", "eu"), priceMultiplier: 0.95 },
  { name: "Introductory Chemistry", level: "college", department: "Chemistry", courseCode: "CHEM-1405", description: "Atomic structure, bonding, reactions, stoichiometry, and states of matter.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.0 },
  { name: "Introductory Physics", level: "college", department: "Physics", courseCode: "PHYS-1401", description: "Classical mechanics, wave motion, thermodynamics, and electromagnetism.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.0 },
  { name: "Principles of Accounting I", level: "college", department: "Accounting", courseCode: "ACCT-2301", description: "Financial accounting fundamentals, the accounting cycle, and financial statements.", institutions: inst("us"), priceMultiplier: 1.0 },
  { name: "Principles of Marketing", level: "college", department: "Marketing", courseCode: "MRKT-1311", description: "Marketing mix, consumer behavior, segmentation, and the marketing environment.", institutions: inst("us", "uk", "eu"), priceMultiplier: 0.95 },
  { name: "Introduction to Business", level: "college", department: "Business", courseCode: "BUSI-1301", description: "Foundations of business, ownership, management, marketing, and finance.", institutions: inst("us", "uk", "eu"), priceMultiplier: 0.9 },
  { name: "Computer Applications", level: "college", department: "Computer Science", courseCode: "COSC-1301", description: "Office productivity, file management, internet research, and basic programming.", institutions: inst("us"), priceMultiplier: 0.95 },
  { name: "Introduction to Engineering", level: "college", department: "Engineering", courseCode: "ENGR-1201", description: "Engineering disciplines, problem solving, design process, and technical communication.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.0 },
  { name: "Foundations of Nursing", level: "college", department: "Nursing", courseCode: "NURS-1301", description: "Patient care fundamentals, clinical reasoning, and professional practice.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.05 },
  { name: "Anatomy and Physiology I", level: "college", department: "Nursing", courseCode: "BIOL-2401", description: "Tissue types, skeletal, muscular, and nervous systems.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.1 },
  { name: "Introduction to Graphic Design", level: "college", department: "Art & Design", courseCode: "ARTS-1311", description: "Design fundamentals, typography, color theory, and software tools.", institutions: inst("us", "uk", "eu"), priceMultiplier: 0.95 },
  { name: "Introduction to Music Theory", level: "college", department: "Music", courseCode: "MUSI-1301", description: "Notation, scales, chords, rhythm, and ear training.", institutions: inst("us", "uk", "eu"), priceMultiplier: 0.9 },

  // ─── UNDERGRADUATE (Bachelor's) ──────────────────────────────────
  { name: "Calculus I", level: "undergraduate", department: "Mathematics", courseCode: "MATH-141", description: "Limits, derivatives, applications, and an introduction to integration.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.0 },
  { name: "Calculus II", level: "undergraduate", department: "Mathematics", courseCode: "MATH-142", description: "Techniques of integration, sequences, series, and parametric equations.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.05 },
  { name: "Calculus III (Multivariable)", level: "undergraduate", department: "Mathematics", courseCode: "MATH-243", description: "Vector calculus, partial derivatives, multiple integrals, and line integrals.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.1 },
  { name: "Linear Algebra", level: "undergraduate", department: "Mathematics", courseCode: "MATH-240", description: "Vector spaces, linear transformations, eigenvalues, and applications.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.1 },
  { name: "Differential Equations", level: "undergraduate", department: "Mathematics", courseCode: "MATH-260", description: "First and second order ODEs, systems, Laplace transforms, and series solutions.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.1 },
  { name: "Discrete Mathematics", level: "undergraduate", department: "Computer Science", courseCode: "CS-173", description: "Logic, proofs, sets, combinatorics, graphs, and algorithms.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.0 },
  { name: "Probability and Statistics", level: "undergraduate", department: "Mathematics", courseCode: "STAT-200", description: "Probability, random variables, estimation, and hypothesis testing.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.0 },
  { name: "Organic Chemistry I", level: "undergraduate", department: "Chemistry", courseCode: "CHEM-231", description: "Bonding, structure, stereochemistry, reactions, and mechanisms.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.15 },
  { name: "Organic Chemistry II", level: "undergraduate", department: "Chemistry", courseCode: "CHEM-232", description: "Aromatic chemistry, carbonyls, amines, and multistep synthesis.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.15 },
  { name: "Molecular Biology", level: "undergraduate", department: "Biology", courseCode: "BIOL-301", description: "Gene expression, regulation, replication, and molecular techniques.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.05 },
  { name: "Genetics", level: "undergraduate", department: "Biology", courseCode: "BIOL-302", description: "Mendelian, molecular, and population genetics with lab techniques.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.0 },
  { name: "Classical Mechanics", level: "undergraduate", department: "Physics", courseCode: "PHYS-211", description: "Newtonian mechanics, oscillations, waves, and central-force motion.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.1 },
  { name: "Electromagnetism", level: "undergraduate", department: "Physics", courseCode: "PHYS-212", description: "Maxwell equations, fields, waves, and radiation.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.1 },
  { name: "Quantum Mechanics (Intro)", level: "undergraduate", department: "Physics", courseCode: "PHYS-301", description: "Schrodinger equation, operators, angular momentum, and the hydrogen atom.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.15 },
  { name: "Data Structures and Algorithms", level: "undergraduate", department: "Computer Science", courseCode: "CS-201", description: "Arrays, lists, trees, graphs, sorting, searching, and complexity.", institutions: inst("us", "uk", "eu", "asia", "other"), priceMultiplier: 1.05 },
  { name: "Operating Systems", level: "undergraduate", department: "Computer Science", courseCode: "CS-361", description: "Processes, threads, scheduling, memory, file systems, and concurrency.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.1 },
  { name: "Database Systems", level: "undergraduate", department: "Computer Science", courseCode: "CS-340", description: "Relational model, SQL, normalization, transactions, and indexing.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.05 },
  { name: "Software Engineering", level: "undergraduate", department: "Computer Science", courseCode: "CS-321", description: "Software lifecycle, requirements, design, testing, and project management.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.05 },
  { name: "Macroeconomics", level: "undergraduate", department: "Economics", courseCode: "ECON-201", description: "GDP, inflation, monetary and fiscal policy, and economic growth.", institutions: inst("us", "uk", "eu", "asia", "other"), priceMultiplier: 0.95 },
  { name: "Microeconomics", level: "undergraduate", department: "Economics", courseCode: "ECON-202", description: "Markets, consumer theory, firm behavior, and market structures.", institutions: inst("us", "uk", "eu", "asia", "other"), priceMultiplier: 0.95 },
  { name: "Financial Accounting", level: "undergraduate", department: "Accounting", courseCode: "ACCT-211", description: "Recording, summarizing, and reporting business transactions.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.0 },
  { name: "Managerial Accounting", level: "undergraduate", department: "Accounting", courseCode: "ACCT-212", description: "Cost behavior, budgeting, performance evaluation, and decision making.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.0 },
  { name: "Corporate Finance", level: "undergraduate", department: "Finance", courseCode: "FIN-301", description: "Time value of money, capital budgeting, risk, and capital structure.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.0 },
  { name: "Marketing Principles", level: "undergraduate", department: "Marketing", courseCode: "MKT-301", description: "Marketing strategy, consumer behavior, and marketing research.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 0.95 },
  { name: "Introduction to Psychology", level: "undergraduate", department: "Psychology", courseCode: "PSY-101", description: "Behavior, cognition, neuroscience, development, and social psychology.", institutions: inst("us", "uk", "eu", "asia", "other"), priceMultiplier: 0.9 },
  { name: "Abnormal Psychology", level: "undergraduate", department: "Psychology", courseCode: "PSY-301", description: "Diagnostic criteria, etiology, and treatment of psychological disorders.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.0 },
  { name: "Sociology", level: "undergraduate", department: "Sociology", courseCode: "SOC-101", description: "Social structures, institutions, inequality, and social change.", institutions: inst("us", "uk", "eu", "asia", "other"), priceMultiplier: 0.9 },
  { name: "British Literature", level: "undergraduate", department: "English", courseCode: "ENG-201", description: "Survey of British literary history from Beowulf to the present.", institutions: inst("us", "uk", "eu"), priceMultiplier: 0.9 },
  { name: "Modern World History", level: "undergraduate", department: "History", courseCode: "HIST-101", description: "Global history from the 16th century to the present.", institutions: inst("us", "uk", "eu", "asia", "other"), priceMultiplier: 0.9 },
  { name: "Constitutional Law", level: "undergraduate", department: "Political Science", courseCode: "POL-301", description: "Constitutional interpretation, federalism, civil rights, and judicial review.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.1 },
  { name: "Torts", level: "undergraduate", department: "Law / Pre-law", courseCode: "LAW-201", description: "Civil wrongs, negligence, intentional torts, and strict liability.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.1 },
  { name: "Anatomy and Physiology", level: "undergraduate", department: "Biology", courseCode: "BIOL-220", description: "Structure and function of human body systems.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.05 },
  { name: "Microbiology", level: "undergraduate", department: "Biology", courseCode: "BIOL-310", description: "Bacteria, viruses, fungi, immunity, and microbial genetics.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.1 },
  { name: "Biochemistry", level: "undergraduate", department: "Chemistry", courseCode: "CHEM-340", description: "Amino acids, proteins, enzymes, metabolism, and nucleic acids.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.15 },
  { name: "Mechanics of Materials", level: "undergraduate", department: "Engineering", courseCode: "ENGR-310", description: "Stress, strain, torsion, bending, and material failure.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.15 },
  { name: "Thermodynamics", level: "undergraduate", department: "Mechanical Engineering", courseCode: "ME-301", description: "First and second law, cycles, entropy, and applications.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.15 },
  { name: "Circuits I", level: "undergraduate", department: "Electrical Engineering", courseCode: "EE-201", description: "DC and AC circuits, analysis methods, and transient response.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.15 },
  { name: "Computer Architecture", level: "undergraduate", department: "Computer Engineering", courseCode: "CE-301", description: "CPU design, memory hierarchy, I/O, and pipelining.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.15 },
  { name: "Digital Logic Design", level: "undergraduate", department: "Electrical Engineering", courseCode: "EE-220", description: "Boolean algebra, combinational and sequential logic, and FPGAs.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.1 },
  { name: "Art History I", level: "undergraduate", department: "Art History", courseCode: "ARTH-101", description: "Art from prehistory through the late medieval period.", institutions: inst("us", "uk", "eu"), priceMultiplier: 0.95 },
  { name: "Graphic Design Studio", level: "undergraduate", department: "Design", courseCode: "ART-301", description: "Typography, layout, identity, and portfolio development.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.0 },
  { name: "Music Theory I", level: "undergraduate", department: "Music", courseCode: "MUS-101", description: "Harmony, melody, rhythm, and analysis of common-practice repertoire.", institutions: inst("us", "uk", "eu"), priceMultiplier: 0.9 },

  // ─── MASTER'S DEGREES ───────────────────────────────────────────
  { name: "Advanced Statistical Inference", level: "masters", department: "Statistics", courseCode: "STAT-501", description: "Estimation, hypothesis testing, Bayesian and frequentist methods.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.0 },
  { name: "Machine Learning", level: "masters", department: "Computer Science", courseCode: "CS-584", description: "Supervised and unsupervised learning, neural networks, and evaluation.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.05 },
  { name: "Deep Learning", level: "masters", department: "Computer Science", courseCode: "CS-585", description: "CNNs, RNNs, transformers, and large-scale training.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.1 },
  { name: "Advanced Algorithms", level: "masters", department: "Computer Science", courseCode: "CS-501", description: "Approximation, randomized, online, and parameterized algorithms.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.05 },
  { name: "Distributed Systems", level: "masters", department: "Computer Science", courseCode: "CS-590", description: "Consensus, replication, fault tolerance, and distributed algorithms.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.1 },
  { name: "Advanced Corporate Finance", level: "masters", department: "Finance", courseCode: "FIN-501", description: "Capital structure, payout policy, M&A, and valuation.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.0 },
  { name: "Strategic Management", level: "masters", department: "Management", courseCode: "MBA-510", description: "Competitive strategy, industry analysis, and value creation.", institutions: inst("us", "uk", "eu", "asia", "other"), priceMultiplier: 1.0 },
  { name: "Marketing Analytics", level: "masters", department: "Marketing", courseCode: "MKT-540", description: "Customer data, segmentation, attribution, and experiment design.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.05 },
  { name: "Biostatistics", level: "masters", department: "Public Health", courseCode: "PH-520", description: "Regression, survival analysis, and epidemiological methods.", institutions: inst("us", "uk", "eu", "asia", "other"), priceMultiplier: 1.1 },
  { name: "Epidemiology", level: "masters", department: "Public Health", courseCode: "PH-510", description: "Study design, measures of disease, bias, and surveillance.", institutions: inst("us", "uk", "eu", "asia", "other"), priceMultiplier: 1.0 },
  { name: "Organic Synthesis", level: "masters", department: "Chemistry", courseCode: "CHEM-510", description: "Advanced retrosynthesis, named reactions, and stereoselective methods.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.1 },
  { name: "Theoretical Physics", level: "masters", department: "Physics", courseCode: "PHYS-510", description: "Classical and quantum field theory, symmetries, and applications.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.1 },
  { name: "Public International Law", level: "masters", department: "Law", courseCode: "LAW-501", description: "Treaties, state responsibility, jurisdiction, and international courts.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.05 },
  { name: "Architectural Design Studio", level: "masters", department: "Architecture", courseCode: "ARCH-501", description: "Studio-based design, site analysis, and conceptual development.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.0 },
  { name: "Design Studio: Type & Identity", level: "masters", department: "Design", courseCode: "DES-510", description: "Advanced typography, identity systems, and editorial design.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.0 },

  // ─── DOCTORAL DEGREES ───────────────────────────────────────────
  { name: "Research Methods in [Field]", level: "doctoral", department: "Varies by field", courseCode: "RES-700", description: "Quantitative and qualitative methods for original research.", institutions: inst("us", "uk", "eu", "asia", "other"), priceMultiplier: 0.95 },
  { name: "Doctoral Seminar in [Field]", level: "doctoral", department: "Varies by field", courseCode: "SEM-720", description: "Reading, presenting, and critiquing current research literature.", institutions: inst("us", "uk", "eu"), priceMultiplier: 0.95 },
  { name: "Advanced Quantitative Methods", level: "doctoral", department: "Statistics / Social Sciences", courseCode: "QUANT-710", description: "Multilevel models, structural equation modeling, and causal inference.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.0 },
  { name: "Dissertation Research", level: "doctoral", department: "Varies by field", courseCode: "DISS-799", description: "Original dissertation research under faculty supervision.", institutions: inst("us", "uk", "eu", "asia", "other"), priceMultiplier: 1.0 },
  { name: "Advanced Topics in Computer Science", level: "doctoral", department: "Computer Science", courseCode: "CS-790", description: "Cutting-edge research topics in theory, systems, and AI.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 1.05 },
  { name: "Advanced Topics in Organic Chemistry", level: "doctoral", department: "Chemistry", courseCode: "CHEM-790", description: "Recent advances in catalysis, synthesis, and mechanism.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.0 },
  { name: "Advanced Topics in Public Health", level: "doctoral", department: "Public Health", courseCode: "PH-790", description: "Critical analysis of current public health research and policy.", institutions: inst("us", "uk", "eu", "asia", "other"), priceMultiplier: 1.0 },
  { name: "Clinical Practicum (Doctoral)", level: "doctoral", department: "Clinical Psychology", courseCode: "PSY-790", description: "Supervised clinical assessment and intervention at the doctoral level.", institutions: inst("us", "uk", "eu"), priceMultiplier: 1.0 },

  // ─── RESEARCH DEGREES ───────────────────────────────────────────
  { name: "Research Thesis (Master's)", level: "research", department: "Varies by field", courseCode: "THESIS-600", description: "Original research project for a research-focused master's program.", institutions: inst("us", "uk", "eu", "asia", "other"), priceMultiplier: 0.95 },
  { name: "Doctoral Thesis", level: "research", department: "Varies by field", courseCode: "THESIS-900", description: "Original doctoral thesis under faculty supervision.", institutions: inst("us", "uk", "eu", "asia", "other"), priceMultiplier: 0.95 },
  { name: "Doctoral Dissertation", level: "research", department: "Varies by field", courseCode: "DISS-900", description: "Original doctoral dissertation research and writing.", institutions: inst("us", "uk", "eu", "asia", "other"), priceMultiplier: 0.95 },
  { name: "Postdoctoral Research Project", level: "research", department: "Varies by field", courseCode: "POSTDOC-900", description: "Independent postdoctoral research and publication.", institutions: inst("us", "uk", "eu", "asia"), priceMultiplier: 0.95 },

  // ─── PROFESSIONAL RESEARCH PROGRAMMES ──────────────────────────
  { name: "Postgraduate Diploma in [Field]", level: "professional", department: "Varies by field", courseCode: "PGDIP-500", description: "Postgraduate diploma coursework, applied to professional practice.", institutions: inst("us", "uk", "eu", "asia", "other"), priceMultiplier: 1.0 },
  { name: "Postgraduate Certificate in [Field]", level: "professional", department: "Varies by field", courseCode: "PGCERT-400", description: "Shorter postgraduate certificate programme for working professionals.", institutions: inst("us", "uk", "eu", "asia", "other"), priceMultiplier: 1.0 },
  { name: "Graduate Diploma in [Field]", level: "professional", department: "Varies by field", courseCode: "GRADDIP-500", description: "Graduate diploma for professional specialisation.", institutions: inst("us", "uk", "eu", "asia", "other"), priceMultiplier: 1.0 },
  { name: "Graduate Certificate in [Field]", level: "professional", department: "Varies by field", courseCode: "GRADCERT-400", description: "Short graduate certificate programme.", institutions: inst("us", "uk", "eu", "asia", "other"), priceMultiplier: 1.0 },
];

// Convenience: group subjects by level slug
export function getSubjectsByLevel(): Record<AcademicLevelSlug, AcademicSubject[]> {
  const out: Record<string, AcademicSubject[]> = {};
  for (const s of ACADEMIC_SUBJECTS) {
    if (!out[s.level]) out[s.level] = [];
    out[s.level].push(s);
  }
  return out as Record<AcademicLevelSlug, AcademicSubject[]>;
}

// Search the catalog. Returns subjects that match the query (name, department,
// course code, description) filtered by the optional level slug.
export function searchAcademicSubjects(query: string, level?: string) {
  const q = query.trim().toLowerCase();
  return ACADEMIC_SUBJECTS.filter((s) => {
    if (level && s.level !== level) return false;
    if (!q) return true;
    const haystack = [s.name, s.department, s.courseCode, s.description, s.level]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
