import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, CheckCircle2, Briefcase, Award, Clock, MessageCircle, ArrowRight, Globe, GraduationCap, Languages } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

const i = (a: string, b: string) => `${a[0]}${b[0]}`.toUpperCase();
const photo = (seed: number) => `https://randomuser.me/api/portraits/${seed % 2 === 0 ? "men" : "women"}/${(seed * 17) % 90}.jpg`;

const reviews = [
  { n: "Robert K.", initials: i("R","K"), r: 5, q: "Exceptional work. Delivered a clean, publication-ready analysis ahead of schedule. Will hire again." },
  { n: "Mei L.", initials: i("M","L"), r: 5, q: "Brilliant at explaining complex topics. Helped me understand my own work better." },
  { n: "Akira T.", initials: i("A","T"), r: 5, q: "Reliable, thorough, and very clear in communication. Highly recommended." },
  { n: "Sofia R.", initials: i("S","R"), r: 4, q: "Solid work and quick turnaround. Would use again for similar projects." },
];

// Same expert data as the listing page. Pulled into a single map so
// the listing and detail pages stay in sync.
const experts: Record<string, {
  id: number;
  name: string;
  headline: string;
  initials: string;
  country: string;
  rating: number;
  jobs: number;
  expertise: string[];
  photoSeed: number;
  languages: string[];
  bio: string;
  education?: string;
  focus?: string[];
}> = {
  "1": { id: 1,  name: "Dr. Sarah Chen",         headline: "Biostatistician, PhD",            initials: i("S","C"), country: "Singapore",  rating: 4.9, jobs: 87,  expertise: ["Mathematics & Statistics", "Medicine & Health"], photoSeed: 11, languages: ["English", "Mandarin"], bio: "PhD in Biostatistics from NUS with 8 years of experience in clinical trial design, survival analysis, and epidemiological research. Published in JAMA, Lancet, and NEJM. I help researchers, graduate students, and biotech teams with statistical methodology, analysis, and reporting.", education: "PhD, National University of Singapore", focus: ["Survival analysis", "Clinical trials", "Epidemiology"] },
  "2": { id: 2,  name: "James O'Brien",         headline: "Full-stack engineer",              initials: i("J","O"), country: "Ireland",    rating: 5.0, jobs: 124, expertise: ["Technology & Computing"], photoSeed: 22, languages: ["English"], bio: "Senior full-stack engineer with 10+ years building production systems for startups and scale-ups. Specialise in TypeScript, React, Next.js, Node, and PostgreSQL. I've shipped MVPs for 30+ founders and lead architecture reviews for engineering teams.", education: "BSc Computer Science, Trinity College Dublin", focus: ["Next.js", "TypeScript", "PostgreSQL"] },
  "3": { id: 3,  name: "Aisha Mwangi",           headline: "Economist, MA Oxford",             initials: i("A","M"), country: "Kenya",      rating: 4.8, jobs: 56,  expertise: ["Business & Finance", "Humanities & Social Sciences"], photoSeed: 33, languages: ["English", "Swahili", "French"], bio: "Economist and policy analyst with an MA from Oxford and 7 years of consulting experience. I've delivered market analyses, policy briefs, and financial models for governments, NGOs, and startups across East Africa and Europe.", education: "MA Economics, University of Oxford", focus: ["Market analysis", "Policy briefs", "Financial models"] },
  "4": { id: 4,  name: "Marco Rossi",            headline: "Mechanical engineer",              initials: i("M","R"), country: "Italy",      rating: 4.9, jobs: 73,  expertise: ["Science & Engineering"], photoSeed: 44, languages: ["English", "Italian"], bio: "Mechanical engineer specialising in CAD/FEA for automotive and aerospace. 12 years at Fiat and Leonardo. I help with part design, stress analysis, GD&T, and manufacturing documentation.", education: "MSc Mechanical Engineering, Politecnico di Milano", focus: ["CAD/FEA", "GD&T", "Automotive"] },
  "5": { id: 5,  name: "Hana Yamada",           headline: "Linguist and translator",          initials: i("H","Y"), country: "Japan",      rating: 4.9, jobs: 91,  expertise: ["Humanities & Social Sciences"], photoSeed: 55, languages: ["English", "Japanese", "Korean"], bio: "Linguist with 9 years of certified translation experience (JA-EN, KO-EN). Specialize in legal, medical, and academic documents. ATA-certified.", education: "MA Linguistics, University of Tokyo", focus: ["Legal translation", "Medical translation", "Academic"] },
  "6": { id: 6,  name: "Liam Foster",            headline: "Data scientist",                  initials: i("L","F"), country: "Australia",  rating: 4.7, jobs: 48,  expertise: ["Technology & Computing", "Mathematics & Statistics"], photoSeed: 66, languages: ["English"], bio: "Data scientist with 6 years of experience in Python, R, and SQL. Specialize in NLP, time-series forecasting, and recommendation systems. I've built production ML pipelines for retail and finance.", education: "MSc Data Science, University of Melbourne", focus: ["NLP", "Time-series", "ML pipelines"] },
  "7": { id: 7,  name: "Sofia Garcia",           headline: "Graphic designer, MFA",           initials: i("S","G"), country: "Spain",      rating: 5.0, jobs: 102, expertise: ["Arts & Design"], photoSeed: 77, languages: ["English", "Spanish", "Catalan"], bio: "MFA from Parsons. Brand identity, editorial design, and packaging. Clients have included Adobe, TEDx, and the City of Barcelona.", education: "MFA, Parsons School of Design", focus: ["Brand identity", "Editorial", "Packaging"] },
  "8": { id: 8,  name: "Daniel Kruger",          headline: "Lawyer, LLM",                      initials: i("D","K"), country: "Germany",    rating: 4.8, jobs: 39,  expertise: ["Law & Policy"], photoSeed: 88, languages: ["English", "German"], bio: "Lawyer with LLM from Humboldt. Corporate, contract, and international trade law. 10 years at a top-tier German firm.", education: "LLM, Humboldt University Berlin", focus: ["Corporate law", "Contracts", "International trade"] },
  "9": { id: 9,  name: "Priya Nair",             headline: "Mechanical engineer, MTech",      initials: i("P","N"), country: "India",      rating: 4.7, jobs: 64,  expertise: ["Science & Engineering"], photoSeed: 13, languages: ["English", "Hindi", "Malayalam"], bio: "MTech from IIT Madras. 8 years at Tata Motors working on chassis design and CAE. I help with FEA reports, design reviews, and manufacturing feasibility.", education: "MTech, IIT Madras", focus: ["Chassis design", "CAE", "Manufacturing"] },
  "10": { id: 10, name: "Lucas Almeida",          headline: "Software architect",              initials: i("L","A"), country: "Brazil",     rating: 4.9, jobs: 88,  expertise: ["Technology & Computing"], photoSeed: 24, languages: ["English", "Portuguese"], bio: "Software architect with 12+ years building distributed systems. Ex-IBM, ex-Mercado Libre. I help teams design microservices, event-driven architectures, and data pipelines.", education: "MSc Computer Science, USP", focus: ["Microservices", "Event-driven", "Data pipelines"] },
  "11": { id: 11, name: "Dr. Amelia Hart",        headline: "Clinical psychologist, PhD",        initials: i("A","H"), country: "United Kingdom", rating: 4.9, jobs: 52, expertise: ["Medicine & Health", "Humanities & Social Sciences"], photoSeed: 35, languages: ["English"], bio: "PhD in clinical psychology from King's College London. 10 years on NHS and private practice. I help with literature reviews, research methodology, and case formulation.", education: "PhD Clinical Psychology, King's College London", focus: ["CBT", "Research methods", "Case formulation"] },
  "12": { id: 12, name: "Noah Bergstrom",         headline: "Mechanical design engineer",      initials: i("N","B"), country: "Sweden",     rating: 4.6, jobs: 41,  expertise: ["Science & Engineering"], photoSeed: 46, languages: ["English", "Swedish"], bio: "Mechanical design engineer with 9 years at Husqvarna and Volvo. Specialise in CAD assemblies, GD&T, and design for manufacturability.", education: "MSc Mechanical Engineering, KTH", focus: ["CAD", "GD&T", "DFM"] },
  "13": { id: 13, name: "Yuki Watanabe",         headline: "Frontend engineer",               initials: i("Y","W"), country: "Japan",      rating: 4.8, jobs: 79,  expertise: ["Technology & Computing", "Arts & Design"], photoSeed: 57, languages: ["English", "Japanese"], bio: "Frontend engineer specialising in React, Next.js, and TypeScript. 7 years building design systems and accessible UI. I help with component architecture, performance, and UX.", education: "BSc Information Science, Kyoto University", focus: ["React", "Next.js", "Accessibility"] },
  "14": { id: 14, name: "Camila Restrepo",        headline: "Public health researcher, MPH",    initials: i("C","R"), country: "Colombia",   rating: 4.9, jobs: 67,  expertise: ["Medicine & Health"], photoSeed: 68, languages: ["English", "Spanish", "Portuguese"], bio: "MPH from Universidad de los Andes. 8 years working on infectious disease surveillance and maternal health programs. I help with study design, IRB submissions, and reports.", education: "MPH, Universidad de los Andes", focus: ["Surveillance", "Maternal health", "IRB"] },
  "15": { id: 15, name: "Tomas Novak",            headline: "Backend engineer",                initials: i("T","N"), country: "Czech Republic", rating: 4.7, jobs: 58, expertise: ["Technology & Computing"], photoSeed: 79, languages: ["English", "Czech"], bio: "Backend engineer with 8 years building scalable APIs in Go and Python. Specialise in event-driven systems, gRPC, and PostgreSQL performance tuning.", education: "MSc Computer Science, Charles University", focus: ["Go", "Python", "gRPC"] },
  "16": { id: 16, name: "Dr. Olivia Mensah",      headline: "Public health, DrPH",              initials: i("O","M"), country: "Ghana",      rating: 5.0, jobs: 34,  expertise: ["Medicine & Health"], photoSeed: 12, languages: ["English", "Twi", "French"], bio: "DrPH from LSHTM. 12 years leading community health programs in West Africa. I help with grant proposals, program evaluations, and policy briefs.", education: "DrPH, London School of Hygiene & Tropical Medicine", focus: ["Program evaluation", "Grant writing", "Policy"] },
  "17": { id: 17, name: "Henrik Larsson",         headline: "Renewable energy engineer",        initials: i("H","L"), country: "Denmark",    rating: 4.8, jobs: 49,  expertise: ["Science & Engineering"], photoSeed: 23, languages: ["English", "Swedish", "Danish"], bio: "Renewable energy engineer with 9 years at Vestas and Siemens Gamesa. Specialise in wind turbine design, grid integration, and feasibility studies.", education: "MSc Energy Engineering, DTU", focus: ["Wind", "Grid integration", "Feasibility"] },
  "18": { id: 18, name: "Mei Lin Zhao",           headline: "Mandarin and Cantonese translator", initials: i("M","Z"), country: "China",      rating: 4.9, jobs: 92,  expertise: ["Humanities & Social Sciences"], photoSeed: 34, languages: ["English", "Mandarin", "Cantonese"], bio: "Certified translator with 11 years of experience. Specialise in legal, financial, and marketing translation between English and Mandarin/Cantonese.", education: "MA Translation Studies, Peking University", focus: ["Legal", "Financial", "Marketing"] },
  "19": { id: 19, name: "Elena Petrova",          headline: "Marketing analyst",               initials: i("E","P"), country: "Bulgaria",   rating: 4.7, jobs: 63,  expertise: ["Business & Finance"], photoSeed: 45, languages: ["English", "Bulgarian", "Russian"], bio: "Marketing analyst with 6 years at agencies in London and Sofia. Specialise in attribution modelling, customer segmentation, and campaign analytics.", education: "MSc Marketing, London Business School", focus: ["Attribution", "Segmentation", "Analytics"] },
  "20": { id: 20, name: "Khalid Rahman",          headline: "Renewable energy engineer, MSc",   initials: i("K","R"), country: "Bangladesh", rating: 4.6, jobs: 38,  expertise: ["Science & Engineering"], photoSeed: 56, languages: ["English", "Bengali", "Hindi"], bio: "MSc renewable energy with 6 years designing off-grid solar systems in South Asia. I help with feasibility studies, system sizing, and donor reports.", education: "MSc Renewable Energy, BRAC University", focus: ["Off-grid solar", "Feasibility", "Donor reports"] },
  "21": { id: 21, name: "Dr. Wei Zhang",          headline: "PhD in pure mathematics",         initials: i("W","Z"), country: "Singapore",  rating: 4.9, jobs: 44,  expertise: ["Mathematics & Statistics"], photoSeed: 67, languages: ["English", "Mandarin"], bio: "PhD in pure mathematics from NUS. 7 years of research in algebraic topology. I help with proofs, problem sets, and advanced coursework at masters and PhD level.", education: "PhD Mathematics, NUS", focus: ["Algebraic topology", "Proofs", "Problem sets"] },
  "22": { id: 22, name: "Beatriz Costa",          headline: "UX researcher",                   initials: i("B","C"), country: "Portugal",   rating: 4.8, jobs: 55,  expertise: ["Arts & Design", "Humanities & Social Sciences"], photoSeed: 78, languages: ["English", "Portuguese", "Spanish"], bio: "UX researcher with 6 years at design agencies and in-house teams. I run user interviews, usability tests, and survey analyses for B2B and consumer products.", education: "MSc Human-Computer Interaction, University of Lisbon", focus: ["User interviews", "Usability", "Surveys"] },
  "23": { id: 23, name: "Felix Schmidt",          headline: "Civil engineer",                  initials: i("F","S"), country: "Austria",    rating: 4.7, jobs: 71,  expertise: ["Science & Engineering"], photoSeed: 89, languages: ["English", "German"], bio: "Civil engineer with 11 years at Strabag. Specialise in structural analysis, bridge design, and FEM modelling with RFEM and SAP2000.", education: "MSc Civil Engineering, TU Vienna", focus: ["Bridges", "FEM", "Structural analysis"] },
  "24": { id: 24, name: "Aaliyah Khan",           headline: "Pharmacist, PharmD",              initials: i("A","K"), country: "Pakistan",   rating: 4.9, jobs: 29,  expertise: ["Medicine & Health"], photoSeed: 14, languages: ["English", "Urdu", "Hindi"], bio: "PharmD from Baqai Medical University. 5 years in clinical pharmacy and drug information. I help with pharmacology assignments, drug interaction checks, and case studies.", education: "PharmD, Baqai Medical University", focus: ["Clinical pharmacy", "Drug interactions", "Case studies"] },
  "25": { id: 25, name: "Lucia Bianchi",          headline: "Italian translator",              initials: i("L","B"), country: "Italy",      rating: 4.8, jobs: 86,  expertise: ["Humanities & Social Sciences"], photoSeed: 25, languages: ["English", "Italian", "French"], bio: "Certified Italian translator with 10 years of experience. Specialise in literary, marketing, and e-commerce translation. Native Italian, fluent English and French.", education: "MA Translation, University of Bologna", focus: ["Literary", "Marketing", "E-commerce"] },
  "26": { id: 26, name: "Theo van den Berg",      headline: "Quantitative analyst",             initials: i("T","V"), country: "Netherlands", rating: 4.7, jobs: 47,  expertise: ["Mathematics & Statistics", "Business & Finance"], photoSeed: 36, languages: ["English", "Dutch"], bio: "Quantitative analyst at a hedge fund. MSc in Mathematical Finance from Amsterdam. I help with derivatives pricing, risk models, and quant interviews.", education: "MSc Mathematical Finance, University of Amsterdam", focus: ["Derivatives", "Risk", "Quant interviews"] },
  "27": { id: 27, name: "Rina Patel",             headline: "Mobile app developer",            initials: i("R","P"), country: "India",      rating: 4.8, jobs: 81,  expertise: ["Technology & Computing"], photoSeed: 47, languages: ["English", "Hindi", "Gujarati"], bio: "Mobile app developer with 7 years building React Native and Swift apps. I've shipped 25+ apps to the App Store and Google Play. I help with MVP builds and code reviews.", education: "BTech Computer Engineering, NIT Surat", focus: ["React Native", "Swift", "MVPs"] },
  "28": { id: 28, name: "Dr. Magnus Berg",        headline: "PhD, organic chemistry",          initials: i("M","B"), country: "Norway",     rating: 4.9, jobs: 36,  expertise: ["Science & Engineering"], photoSeed: 58, languages: ["English", "Norwegian", "Swedish"], bio: "PhD in organic chemistry from NTNU. 6 years of postdoc at ETH Zurich. I help with synthesis problems, mechanism drawings, and NMR interpretation.", education: "PhD Organic Chemistry, NTNU", focus: ["Synthesis", "Mechanisms", "NMR"] },
  "29": { id: 29, name: "Amara Diallo",           headline: "Sociologist",                      initials: i("A","D"), country: "Senegal",    rating: 4.7, jobs: 42,  expertise: ["Humanities & Social Sciences"], photoSeed: 69, languages: ["English", "French", "Wolof"], bio: "Sociologist with 7 years of research experience in West Africa. Specialise in qualitative methods, ethnography, and survey design.", education: "PhD Sociology, University of Dakar", focus: ["Qualitative methods", "Ethnography", "Survey design"] },
  "30": { id: 30, name: "Krzysztof Nowak",        headline: "Embedded systems engineer",       initials: i("K","N"), country: "Poland",     rating: 4.8, jobs: 60,  expertise: ["Technology & Computing"], photoSeed: 10, languages: ["English", "Polish"], bio: "Embedded systems engineer with 9 years at Intel and Nordic Semiconductor. Specialise in C/C++ firmware, RTOS, and low-power design.", education: "MSc Electronics, Warsaw University of Technology", focus: ["Firmware", "RTOS", "Low-power"] },
  "31": { id: 31, name: "Ines Marques",           headline: "Graphic designer",                initials: i("I","M"), country: "Portugal",   rating: 4.9, jobs: 73,  expertise: ["Arts & Design"], photoSeed: 21, languages: ["English", "Portuguese"], bio: "Graphic designer with 8 years at branding agencies in Lisbon. Specialise in brand identity, packaging, and editorial design.", education: "BA Graphic Design, IADE", focus: ["Brand identity", "Packaging", "Editorial"] },
  "32": { id: 32, name: "Dr. Rajesh Iyer",        headline: "PhD, electrical engineering",     initials: i("R","I"), country: "India",      rating: 4.8, jobs: 51,  expertise: ["Science & Engineering"], photoSeed: 32, languages: ["English", "Hindi", "Tamil"], bio: "PhD in electrical engineering from IISc Bangalore. 7 years of research in power systems and renewable integration. I help with thesis chapters and journal revisions.", education: "PhD Electrical Engineering, IISc Bangalore", focus: ["Power systems", "Renewables", "Thesis help"] },
  "33": { id: 33, name: "Hannah Olsen",           headline: "Marketing copywriter",            initials: i("H","O"), country: "Denmark",    rating: 4.9, jobs: 68,  expertise: ["Business & Finance", "Arts & Design"], photoSeed: 43, languages: ["English", "Danish", "Swedish"], bio: "Marketing copywriter with 9 years in agencies and in-house. Specialise in conversion copy, email sequences, and brand voice development.", education: "MA English, University of Copenhagen", focus: ["Conversion copy", "Email sequences", "Brand voice"] },
  "34": { id: 34, name: "Diego Velasquez",        headline: "Spanish translator",             initials: i("D","V"), country: "Mexico",     rating: 4.7, jobs: 54,  expertise: ["Humanities & Social Sciences"], photoSeed: 54, languages: ["English", "Spanish"], bio: "Certified Spanish translator with 8 years. Specialise in legal, medical, and marketing translation. Native Mexican Spanish.", education: "BA Translation, UNAM", focus: ["Legal", "Medical", "Marketing"] },
  "35": { id: 35, name: "Anya Kowalski",          headline: "Frontend engineer, React",       initials: i("A","K"), country: "Poland",     rating: 4.8, jobs: 77,  expertise: ["Technology & Computing"], photoSeed: 65, languages: ["English", "Polish"], bio: "Frontend engineer specialising in React, TypeScript, and Next.js. 6 years at Allegro and smaller startups. I help with component architecture and performance.", education: "BSc Computer Science, University of Warsaw", focus: ["React", "TypeScript", "Next.js"] },
  "36": { id: 36, name: "Dr. Hugo Lambert",       headline: "PhD, theoretical physics",       initials: i("H","L"), country: "France",     rating: 5.0, jobs: 27,  expertise: ["Science & Engineering"], photoSeed: 76, languages: ["English", "French"], bio: "PhD in theoretical physics from ENS Paris. 8 years at CNRS. I help with advanced coursework, problem sets, and thesis chapters in theoretical physics and math.", education: "PhD Physics, ENS Paris", focus: ["Theoretical physics", "Mathematical methods"] },
  "37": { id: 37, name: "Saoirse Murphy",         headline: "Editor and proofreader",          initials: i("S","M"), country: "Ireland",    rating: 4.9, jobs: 95,  expertise: ["Humanities & Social Sciences", "Arts & Design"], photoSeed: 87, languages: ["English", "Irish"], bio: "Professional editor and proofreader with 12 years in trade publishing. Specialise in developmental editing, line editing, and copyediting for fiction and non-fiction.", education: "MA English Literature, Trinity College Dublin", focus: ["Developmental editing", "Line editing", "Copyediting"] },
  "38": { id: 38, name: "Mateo Silva",            headline: "Data engineer",                   initials: i("M","S"), country: "Argentina",  rating: 4.7, jobs: 59,  expertise: ["Technology & Computing", "Mathematics & Statistics"], photoSeed: 16, languages: ["English", "Spanish"], bio: "Data engineer with 6 years at Mercado Libre and Globant. Specialise in Python, Spark, and Airflow. I help with ETL pipelines and data warehouse design.", education: "BSc Computer Science, University of Buenos Aires", focus: ["Python", "Spark", "Airflow"] },
  "39": { id: 39, name: "Dr. Imani Okeke",         headline: "PhD, public health",              initials: i("I","O"), country: "Nigeria",    rating: 4.9, jobs: 41,  expertise: ["Medicine & Health"], photoSeed: 27, languages: ["English", "Yoruba", "French"], bio: "PhD in public health from University of Cape Town. 9 years leading community health programs in West Africa. I help with study design, IRB submissions, and grant proposals.", education: "PhD Public Health, University of Cape Town", focus: ["Study design", "IRB", "Grants"] },
  "40": { id: 40, name: "Yannick Dubois",         headline: "DevOps engineer",                 initials: i("Y","D"), country: "France",     rating: 4.8, jobs: 64,  expertise: ["Technology & Computing"], photoSeed: 38, languages: ["English", "French"], bio: "DevOps engineer with 8 years at OVHcloud and BlaBlaCar. Specialise in Kubernetes, Terraform, and observability. I help with infra migrations and CI/CD setup.", education: "MSc Computer Science, INSA Lyon", focus: ["Kubernetes", "Terraform", "CI/CD"] },
  "41": { id: 41, name: "Linnea Strom",           headline: "Environmental scientist",         initials: i("L","S"), country: "Sweden",     rating: 4.7, jobs: 38,  expertise: ["Science & Engineering"], photoSeed: 49, languages: ["English", "Swedish"], bio: "Environmental scientist with 7 years at IVL and the Swedish EPA. I help with life cycle assessments, environmental impact studies, and reports.", education: "PhD Environmental Science, Stockholm University", focus: ["LCA", "Impact studies", "Reports"] },
  "42": { id: 42, name: "Mateus Oliveira",        headline: "Business analyst",               initials: i("M","O"), country: "Brazil",     rating: 4.6, jobs: 49,  expertise: ["Business & Finance"], photoSeed: 50, languages: ["English", "Portuguese"], bio: "Business analyst with 6 years at PwC and Nubank. Specialise in financial modelling, market sizing, and pitch decks.", education: "BSc Business Administration, FGV", focus: ["Financial modelling", "Market sizing", "Pitch decks"] },
  "43": { id: 43, name: "Dr. Greta Bauer",        headline: "PhD, applied linguistics",       initials: i("G","B"), country: "Germany",    rating: 4.9, jobs: 33,  expertise: ["Humanities & Social Sciences"], photoSeed: 61, languages: ["English", "German", "French"], bio: "PhD in applied linguistics from Humboldt. 8 years of research in corpus linguistics and discourse analysis. I help with thesis chapters and academic papers.", education: "PhD Applied Linguistics, Humboldt University", focus: ["Corpus linguistics", "Discourse analysis", "Thesis help"] },
  "44": { id: 44, name: "Eduardo Pinheiro",      headline: "Architect, MArch",                initials: i("E","P"), country: "Brazil",     rating: 4.8, jobs: 42,  expertise: ["Arts & Design", "Science & Engineering"], photoSeed: 72, languages: ["English", "Portuguese", "Spanish"], bio: "Architect with 10 years at Studio MK27 and international firms. MArch from USP. I help with concept design, technical drawings, and project presentations.", education: "MArch, University of Sao Paulo", focus: ["Concept design", "Technical drawings", "Presentations"] },
  "45": { id: 45, name: "Nadia Khoury",           headline: "Arabic and French translator",    initials: i("N","K"), country: "Lebanon",    rating: 4.9, jobs: 61,  expertise: ["Humanities & Social Sciences"], photoSeed: 83, languages: ["English", "Arabic", "French"], bio: "Certified Arabic and French translator with 11 years. Specialise in legal, academic, and literary translation. Native Arabic, fluent French and English.", education: "MA Translation, University of Saint-Joseph", focus: ["Legal", "Academic", "Literary"] },
  "46": { id: 46, name: "Erik Lindqvist",         headline: "iOS developer",                  initials: i("E","L"), country: "Sweden",     rating: 4.7, jobs: 53,  expertise: ["Technology & Computing"], photoSeed: 18, languages: ["English", "Swedish"], bio: "iOS developer with 8 years at Klarna and King. Specialise in Swift, SwiftUI, and CoreData. I help with app architecture, performance, and App Store submissions.", education: "MSc Computer Science, KTH", focus: ["Swift", "SwiftUI", "CoreData"] },
  "47": { id: 47, name: "Dr. Adaeze Nwosu",       headline: "PhD, public policy",             initials: i("A","N"), country: "Nigeria",    rating: 4.8, jobs: 28,  expertise: ["Law & Policy", "Humanities & Social Sciences"], photoSeed: 29, languages: ["English", "Igbo", "Yoruba"], bio: "PhD in public policy from Oxford. 6 years at the World Bank and UNECA. I help with policy analysis, research design, and reports.", education: "PhD Public Policy, University of Oxford", focus: ["Policy analysis", "Research design", "Reports"] },
  "48": { id: 48, name: "Maja Kowalski",          headline: "Illustrator",                     initials: i("M","K"), country: "Poland",     rating: 4.9, jobs: 70,  expertise: ["Arts & Design"], photoSeed: 40, languages: ["English", "Polish"], bio: "Illustrator with 8 years in editorial and book illustration. Clients include Penguin Random House and National Geographic Poland. I help with covers, editorial illustrations, and character design.", education: "MA Illustration, Academy of Fine Arts Warsaw", focus: ["Editorial", "Covers", "Character design"] },
  "49": { id: 49, name: "Ravi Krishnan",          headline: "QA engineer",                    initials: i("R","K"), country: "India",      rating: 4.7, jobs: 56,  expertise: ["Technology & Computing"], photoSeed: 51, languages: ["English", "Hindi", "Tamil"], bio: "QA engineer with 7 years at Infosys and Razorpay. Specialise in test automation with Cypress and Playwright, performance testing, and CI/CD integration.", education: "BTech IT, NIT Calicut", focus: ["Test automation", "Performance", "CI/CD"] },
  "50": { id: 50, name: "Olu Adetunji",           headline: "Mechanical engineer, MSc",       initials: i("O","A"), country: "Nigeria",    rating: 4.6, jobs: 35,  expertise: ["Science & Engineering"], photoSeed: 62, languages: ["English", "Yoruba"], bio: "MSc in mechanical engineering from University of Lagos. 5 years in oil and gas. I help with FEA, design reviews, and technical reports.", education: "MSc Mechanical Engineering, University of Lagos", focus: ["FEA", "Design review", "Technical reports"] },
};

export function generateStaticParams() {
  return Object.keys(experts).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = experts[id];
  if (!e) return { title: "Expert Profile" };
  return {
    title: `${e.name} — ${e.headline}`,
    description: e.bio.slice(0, 160),
  };
}

export default async function ExpertProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = experts[id];
  if (!e) notFound();

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.04)_1px,transparent_0)] [background-size:28px_28px]" />
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-primary-100/40 blur-3xl" />
        <div className="container-x relative py-10 md:py-14">
          <Link href="/experts" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-900">
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            All experts
          </Link>

          <div className="mt-6 grid lg:grid-cols-12 gap-8 items-start">
            {/* ===================== PORTRAIT ===================== */}
            <div className="lg:col-span-3">
              <div className="relative h-32 w-32 lg:h-44 lg:w-44 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl">
                <Image
                  src={photo(e.photoSeed)}
                  alt={`Portrait of ${e.name}`}
                  fill
                  sizes="(max-width: 1024px) 33vw, 176px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>

            {/* ===================== HEADER ===================== */}
            <div className="lg:col-span-6">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-slate-900 leading-[1.1]">{e.name}</h1>
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" aria-label="Vetted" />
              </div>
              <p className="mt-1 text-base text-slate-700">{e.headline}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                <div className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  <span>{e.country}</span>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  <strong className="text-slate-900">{e.rating}</strong>
                  <span className="text-slate-500">({e.jobs} projects)</span>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  <span>{e.jobs} completed</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {e.expertise.map((x) => (
                  <span key={x} className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                    {x}
                  </span>
                ))}
              </div>
            </div>

            {/* ===================== ACTIONS ===================== */}
            <div className="lg:col-span-3 flex flex-col gap-2">
              <Button asChild size="lg" className="w-full">
                <Link href="/calculator">
                  Hire {e.name.split(" ")[0]} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full">
                <Link href="/contact">
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== BODY ===================== */}
      <Section className="bg-slate-50 border-y border-slate-200">
        <div className="grid lg:grid-cols-[1fr_320px] gap-10">
          {/* ===================== MAIN ===================== */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">About</h2>
            <p className="mt-3 text-slate-700 leading-relaxed text-lg">{e.bio}</p>

            {e.education && (
              <>
                <h2 className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Education</h2>
                <div className="mt-3 flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                  <p className="text-slate-700">{e.education}</p>
                </div>
              </>
            )}

            {e.focus && e.focus.length > 0 && (
              <>
                <h2 className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Focus areas</h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {e.focus.map((f) => (
                    <span key={f} className="text-xs font-medium px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">
                      {f}
                    </span>
                  ))}
                </div>
              </>
            )}

            <div className="mt-10 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Recent reviews</h2>
              <span className="text-xs text-slate-500">{reviews.length} verified</span>
            </div>
            <div className="mt-3 space-y-3">
              {reviews.map((r, i) => (
                <Card key={i} className="p-5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-semibold">
                        {r.initials}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 tracking-tight">{r.n}</div>
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Verified client</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500" aria-label={`${r.r} stars`}>
                      {Array.from({ length: r.r }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-current" aria-hidden="true" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-700 leading-relaxed">{r.q}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* ===================== SIDEBAR ===================== */}
          <aside className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Award className="h-4 w-4 text-slate-500" />
                At a glance
              </h3>
              <dl className="mt-3 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Rating</dt>
                  <dd className="text-slate-900 font-semibold">{e.rating} / 5.0</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Projects done</dt>
                  <dd className="text-slate-900 font-semibold">{e.jobs}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Disciplines</dt>
                  <dd className="text-slate-900 font-semibold">{e.expertise.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Member since</dt>
                  <dd className="text-slate-900 font-semibold">2023</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Response time</dt>
                  <dd className="text-slate-900 font-semibold">~2 hours</dd>
                </div>
              </dl>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Languages className="h-4 w-4 text-slate-500" />
                Languages
              </h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {e.languages.map((l) => (
                  <span key={l} className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {l}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Award className="h-4 w-4 text-slate-500" />
                Skills
              </h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {e.expertise.map((x) => (
                  <span key={x} className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {x}
                  </span>
                ))}
              </div>
            </Card>

            <div className="p-5 rounded-2xl bg-slate-900 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Ready to work?</p>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Send a short brief and we will get {e.name.split(" ")[0]} a reply within
                a few hours.
              </p>
              <Link
                href="/calculator"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-300 hover:text-emerald-200"
              >
                Start a project <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </Section>

      {/* ===================== RELATED EXPERTS ===================== */}
      <Section>
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Similar experts</h2>
            <p className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Other specialists in this area
            </p>
          </div>
          <Link
            href="/experts"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            Browse all experts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(experts)
            .filter((x) => x.id !== e.id && x.expertise.some((t) => e.expertise.includes(t)))
            .slice(0, 4)
            .map((x) => (
              <Link key={x.id} href={`/experts/${x.id}`}>
                <Card hover className="p-4 h-full hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden ring-1 ring-slate-200 bg-slate-100">
                      <Image
                        src={photo(x.photoSeed)}
                        alt={`Portrait of ${x.name}`}
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-slate-900 tracking-tight text-sm truncate">{x.name}</h3>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-xs text-slate-600 truncate">{x.headline}</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-slate-700">{x.rating}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
        </div>
      </Section>
    </>
  );
}

