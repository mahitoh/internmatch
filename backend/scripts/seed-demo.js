/**
 * InternBeacon — Demo Seed Script
 * Cleans all student/company data then seeds realistic demo data for the
 * final year project defence.
 *
 * Usage:
 *   node scripts/seed-demo.js           # dry-run (no writes)
 *   node scripts/seed-demo.js --apply   # execute
 *
 * SAFE: Admin accounts are discovered first and never touched.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { supabaseAdmin } = require('../src/config/supabase');

const APPLY    = process.argv.includes('--apply');
const PASSWORD = 'Demo@2025';
const NIL_UUID = '00000000-0000-0000-0000-000000000000';

// ── Seed data ──────────────────────────────────────────────────────────────────

const STUDENTS = [
  {
    firstName: 'Richcal', lastName: 'Chia',
    email: 'richcal@student.com',
    programme: 'Software Engineering', studyYear: 3, city: 'Yaoundé',
    university: 'ICT University',
    languages: ['English', 'French'],
    skills: [], // no CV yet — uploaded live during demo
    bio: 'Software Engineering student passionate about building impactful digital solutions. Seeking a hands-on internship to apply my academic knowledge in a real-world environment.',
  },
  {
    firstName: 'Brenda', lastName: 'Nfor',
    email: 'brenda.nfor@student.com',
    programme: 'Software Engineering', studyYear: 3, city: 'Yaoundé',
    university: 'ICT University',
    languages: ['English', 'French'],
    skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Git', 'CSS', 'HTML'],
    bio: 'Passionate frontend developer with strong UI skills. Experienced building React applications and working with modern JavaScript frameworks.',
  },
  {
    firstName: 'Michael', lastName: 'Tabi',
    email: 'michael.tabi@student.com',
    programme: 'Computer Science', studyYear: 3, city: 'Douala',
    university: 'University of Douala',
    languages: ['English'],
    skills: ['Python', 'JavaScript', 'Git', 'Java', 'SQL', 'Machine Learning'],
    bio: 'Computer Science student with interests in data analysis, machine learning and backend development. Keen on applying analytical skills to solve real business problems.',
  },
  {
    firstName: 'Cynthia', lastName: 'Ndzi',
    email: 'cynthia.ndzi@student.com',
    programme: 'Information Systems', studyYear: 3, city: 'Yaoundé',
    university: 'University of Yaoundé I',
    languages: ['English', 'French'],
    skills: ['SQL', 'Excel', 'Power BI', 'Data Analysis', 'Microsoft Office', 'Python'],
    bio: 'Information Systems student with strong data analysis and business intelligence skills. Experienced with Power BI dashboards and SQL database queries.',
  },
  {
    firstName: 'Kevin', lastName: 'Ndzi',
    email: 'kevin.ndzi@student.com',
    programme: 'Software Engineering', studyYear: 3, city: 'Douala',
    university: 'ICT University',
    languages: ['English', 'French'],
    skills: ['React', 'JavaScript', 'Node.js', 'Express', 'MongoDB', 'Git'],
    bio: 'Full stack developer with expertise in JavaScript ecosystems and RESTful API development. Comfortable building end-to-end web applications.',
  },
  {
    firstName: 'Vanessa', lastName: 'Ngwa',
    email: 'vanessa.ngwa@student.com',
    programme: 'Cyber Security', studyYear: 3, city: 'Bafoussam',
    university: 'University of Dschang',
    languages: ['English'],
    skills: ['Linux', 'Python', 'Network Security', 'Ethical Hacking', 'Firewalls'],
    bio: 'Cyber Security student with hands-on experience in ethical hacking and network security analysis. Passionate about protecting digital infrastructure.',
  },
  {
    firstName: 'Junior', lastName: 'Fokou',
    email: 'junior.fokou@student.com',
    programme: 'Network Engineering', studyYear: 2, city: 'Douala',
    university: 'University of Douala',
    languages: ['English', 'French'],
    skills: ['Cisco', 'Networking', 'TCP/IP', 'Linux', 'Network Configuration'],
    bio: 'Network Engineering student with practical knowledge of Cisco routing, switching and network infrastructure configuration.',
  },
  {
    firstName: 'Sandra', lastName: 'Neba',
    email: 'sandra.neba@student.com',
    programme: 'Computer Engineering', studyYear: 2, city: 'Bamenda',
    university: 'University of Bamenda',
    languages: ['English'],
    skills: ['C++', 'Java', 'Embedded Systems', 'Arduino', 'Git', 'Python'],
    bio: 'Computer Engineering student with experience in embedded systems, hardware programming and Java application development.',
  },
];

const COMPANIES = [
  {
    companyName: 'TechNova Cameroon',
    email: 'hr@technova.cm',
    sector: 'Software Development & Digital Solutions',
    city: 'Yaoundé',
    address: 'Bastos, Yaoundé, Cameroon',
    phone: '+237 222 000 001',
    websiteUrl: 'https://www.technova.cm',
    employeeSize: '11-50',
    description: 'TechNova Cameroon is a software development company specializing in web applications, mobile solutions, cloud technologies and enterprise software. The company regularly offers internship opportunities to Software Engineering and Computer Science students seeking practical industry experience.',
  },
  {
    companyName: 'SmartSys Technologies',
    email: 'hr@smartsys.cm',
    sector: 'IT Consulting',
    city: 'Douala',
    address: 'Akwa, Douala, Cameroon',
    phone: '+237 233 000 002',
    websiteUrl: 'https://www.smartsys.cm',
    employeeSize: '11-50',
    description: 'SmartSys Technologies is an IT consulting firm providing enterprise systems integration, ERP implementation and technical support services to businesses across Cameroon.',
  },
  {
    companyName: 'Digital Bridge Solutions',
    email: 'careers@digitalbridge.cm',
    sector: 'Networking & Infrastructure',
    city: 'Yaoundé',
    address: 'Centre-ville, Yaoundé, Cameroon',
    phone: '+237 222 000 003',
    websiteUrl: 'https://www.digitalbridge.cm',
    employeeSize: '11-50',
    description: 'Digital Bridge Solutions is a network infrastructure company specializing in structured cabling, fibre optic installation and enterprise network deployment across Cameroon.',
  },
  {
    companyName: 'NexaSoft Cameroon',
    email: 'internships@nexasoft.cm',
    sector: 'Enterprise Software',
    city: 'Douala',
    address: 'Bonanjo, Douala, Cameroon',
    phone: '+237 233 000 004',
    websiteUrl: 'https://www.nexasoft.cm',
    employeeSize: '11-50',
    description: 'NexaSoft Cameroon builds custom ERP, accounting and business management systems for Cameroonian SMEs, helping organizations digitize their core operations.',
  },
  {
    companyName: 'InnovateX Solutions',
    email: 'hr@innovatex.cm',
    sector: 'Digital Transformation',
    city: 'Yaoundé',
    address: 'Nlongkak, Yaoundé, Cameroon',
    phone: '+237 222 000 005',
    websiteUrl: 'https://www.innovatex.cm',
    employeeSize: '11-50',
    description: 'InnovateX Solutions is a digital transformation consultancy helping organizations modernize their processes through mobile applications, cloud platforms and data-driven decision making.',
  },
];

// key: `${companyName}::${title}`
const OFFERS = [
  // ── TechNova (4) ─────────────────────────────────────────────────────────
  {
    company: 'TechNova Cameroon',
    title: 'Software Engineering Intern',
    domain: 'Information Technology',
    location: 'Yaoundé',
    duration_weeks: 12,
    is_paid: false,
    openings: 2,
    deadline: '2026-09-30',
    start_date: '2026-10-15',
    required_skills: ['React', 'Node.js', 'JavaScript', 'Git', 'Python'],
    required_languages: ['English'],
    requirements: 'We welcome undergraduate students in their 3rd year (Licence 3) or above with a passion for software development. English proficiency required. Prior project experience is an advantage.',
    description: 'Join TechNova Cameroon as a Software Engineering Intern and gain hands-on experience building web applications. You will work alongside our engineering team on real client projects using modern JavaScript frameworks and backend technologies.',
  },
  {
    company: 'TechNova Cameroon',
    title: 'Frontend Developer Intern',
    domain: 'Information Technology',
    location: 'Yaoundé',
    duration_weeks: 8,
    is_paid: true,
    stipend_amount: 50000,
    stipend_currency: 'XAF',
    openings: 1,
    deadline: '2026-08-31',
    start_date: '2026-09-15',
    required_skills: ['React', 'JavaScript', 'HTML', 'CSS', 'TypeScript'],
    required_languages: ['English'],
    requirements: 'Undergraduate students Year 2 or above. A portfolio or GitHub projects demonstrating frontend work is required. English required.',
    description: 'We are looking for a creative Frontend Developer Intern to help build responsive user interfaces for our web products. You will work with our design and engineering teams using React and modern CSS frameworks.',
  },
  {
    company: 'TechNova Cameroon',
    title: 'Backend Developer Intern',
    domain: 'Information Technology',
    location: 'Yaoundé',
    duration_weeks: 12,
    is_paid: true,
    stipend_amount: 75000,
    stipend_currency: 'XAF',
    openings: 1,
    deadline: '2026-08-15',
    start_date: '2026-09-01',
    required_skills: ['Node.js', 'JavaScript', 'Express', 'PostgreSQL', 'Git'],
    required_languages: ['English'],
    requirements: 'Undergraduate students Year 2 or above with backend development experience. Knowledge of RESTful APIs and databases required. English required.',
    description: 'TechNova Cameroon is seeking a Backend Developer Intern to support the development of scalable APIs and database systems. You will work with Node.js, Express and PostgreSQL in a production environment.',
  },
  {
    company: 'TechNova Cameroon',
    title: 'UI/UX Design Intern',
    domain: 'Information Technology',
    location: 'Yaoundé',
    duration_weeks: 8,
    is_paid: false,
    openings: 1,
    deadline: '2026-09-15',
    start_date: '2026-10-01',
    required_skills: ['Figma', 'UI-UX Design', 'Wireframing', 'Prototyping', 'Adobe Photoshop'],
    required_languages: ['English', 'French'],
    requirements: 'Undergraduate students Year 2 or above with an eye for design. A portfolio of UI/UX work is strongly preferred. Both English and French language skills required.',
    description: 'Join our product team as a UI/UX Design Intern and help shape the user experience of our web and mobile applications. You will create wireframes, mockups and prototypes using Figma.',
  },
  // ── Other companies (4) ───────────────────────────────────────────────────
  {
    company: 'SmartSys Technologies',
    title: 'IT Consulting & Support Intern',
    domain: 'Information Technology',
    location: 'Douala',
    duration_weeks: 10,
    is_paid: true,
    stipend_amount: 50000,
    stipend_currency: 'XAF',
    openings: 2,
    deadline: '2026-08-30',
    start_date: '2026-09-15',
    required_skills: ['IT Support', 'Windows', 'Active Directory', 'Networking', 'Excel'],
    required_languages: ['English', 'French'],
    requirements: 'Undergraduate students Year 2 or above. Bilingual (English and French) required for client interaction.',
    description: 'SmartSys Technologies is recruiting IT Support Interns to assist with helpdesk operations, hardware maintenance and enterprise system configuration at client sites across Douala.',
  },
  {
    company: 'Digital Bridge Solutions',
    title: 'Network Support Technician Intern',
    domain: 'Telecommunications',
    location: 'Yaoundé',
    duration_weeks: 10,
    is_paid: false,
    openings: 2,
    deadline: '2026-09-30',
    start_date: '2026-10-15',
    required_skills: ['Networking', 'Cisco', 'TCP/IP', 'Linux', 'Fibre Optics'],
    required_languages: ['English'],
    requirements: 'Undergraduate students in Networking, Telecommunications or Computer Engineering Year 2 or above. English required.',
    description: 'Digital Bridge Solutions is looking for Network Support Technician Interns to assist with network installation, configuration and maintenance projects across Yaoundé.',
  },
  {
    company: 'NexaSoft Cameroon',
    title: 'Data Analyst Intern',
    domain: 'Information Technology',
    location: 'Douala',
    duration_weeks: 12,
    is_paid: true,
    stipend_amount: 60000,
    stipend_currency: 'XAF',
    openings: 1,
    deadline: '2026-09-01',
    start_date: '2026-09-15',
    required_skills: ['SQL', 'Excel', 'Power BI', 'Python', 'Data Analysis'],
    required_languages: ['English', 'French'],
    requirements: 'Undergraduate students Year 2 or above with a data analysis or statistics background. Bilingual (English and French) required.',
    description: 'NexaSoft Cameroon is seeking a Data Analyst Intern to support our business intelligence team. You will analyse real datasets, generate reports using Power BI and help clients make data-driven decisions.',
  },
  {
    company: 'InnovateX Solutions',
    title: 'Mobile App Developer Intern',
    domain: 'Information Technology',
    location: 'Yaoundé',
    duration_weeks: 12,
    is_paid: true,
    stipend_amount: 45000,
    stipend_currency: 'XAF',
    openings: 2,
    deadline: '2026-09-30',
    start_date: '2026-10-15',
    required_skills: ['Flutter', 'Dart', 'REST APIs', 'Git', 'JavaScript'],
    required_languages: ['English'],
    requirements: 'Undergraduate students Year 2 or above with mobile development experience or strong interest in cross-platform applications. English required.',
    description: 'InnovateX Solutions is looking for a Mobile App Developer Intern to join our team building Flutter-based mobile applications for digital transformation projects across the region.',
  },
];

// [studentEmail, offerKey (title), status, coverLetter]
// offerKey matches OFFERS title — script finds the right company automatically
const APPLICATIONS = [
  // ── TechNova Software Engineering Intern (DEMO) — 5 applicants ──────────
  ['brenda.nfor@student.com',   'Software Engineering Intern', 'under_review',
    'I am excited to apply for the Software Engineering Internship at TechNova Cameroon. My experience with React, Node.js and JavaScript makes me a strong candidate for this position. I look forward to contributing to your engineering team.'],
  ['kevin.ndzi@student.com',    'Software Engineering Intern', 'under_review',
    'I am applying for the Software Engineering Internship at TechNova Cameroon. With hands-on experience in React, Node.js and MongoDB, I am confident I can contribute meaningfully to your projects.'],
  ['michael.tabi@student.com',  'Software Engineering Intern', 'submitted',
    'I would like to apply for the Software Engineering Internship. My background in Python, JavaScript and data structures makes me well-positioned to take on development challenges at TechNova.'],
  ['sandra.neba@student.com',   'Software Engineering Intern', 'submitted',
    'I am applying for the Software Engineering Internship. Although my background is in Computer Engineering, I have been actively building my web development skills and I am eager to grow at TechNova Cameroon.'],
  ['junior.fokou@student.com',  'Software Engineering Intern', 'submitted',
    'I am interested in the Software Engineering Internship at TechNova Cameroon. I am eager to expand my skills from networking into software development.'],

  // ── TechNova Frontend Developer Intern — Brenda accepted ─────────────────
  ['brenda.nfor@student.com',   'Frontend Developer Intern', 'accepted',
    'I am very excited to apply for the Frontend Developer Internship. React and TypeScript are my primary tools and I have built several projects demonstrating my frontend expertise.'],
  ['kevin.ndzi@student.com',    'Frontend Developer Intern', 'interview_scheduled',
    'Applying for the Frontend Developer Internship. I have solid experience with React and JavaScript and I am passionate about building clean, responsive user interfaces.'],
  ['michael.tabi@student.com',  'Frontend Developer Intern', 'under_review',
    'I would like to apply for the Frontend Developer Internship. I have worked with JavaScript frameworks and I am eager to deepen my frontend development skills.'],
  ['cynthia.ndzi@student.com',  'Frontend Developer Intern', 'submitted',
    'I am applying for the Frontend Developer Internship. I have experience with web technologies and I am keen to apply my skills in a professional environment.'],
  ['sandra.neba@student.com',   'Frontend Developer Intern', 'submitted',
    'Applying for the Frontend Developer Intern position. I am motivated to grow my web development skills working alongside experienced engineers.'],

  // ── TechNova Backend Developer Intern — Kevin accepted ────────────────────
  ['kevin.ndzi@student.com',    'Backend Developer Intern', 'accepted',
    'I am applying for the Backend Developer Internship. Node.js, Express and MongoDB are tools I use regularly and I am eager to work with PostgreSQL in a professional setting at TechNova.'],
  ['michael.tabi@student.com',  'Backend Developer Intern', 'interview_scheduled',
    'I would like to apply for the Backend Developer Internship. Python, SQL and JavaScript are core to my skill set and I am ready to contribute to your backend team.'],
  ['richcal@student.com',       'Backend Developer Intern', 'submitted',
    'I am applying for the Backend Developer Internship at TechNova Cameroon. I am a Software Engineering student eager to gain hands-on backend development experience.'],
  ['junior.fokou@student.com',  'Backend Developer Intern', 'submitted',
    'I would like to apply for the Backend Developer Internship. I am interested in expanding from networking into backend software development.'],

  // ── TechNova UI/UX Design Intern ──────────────────────────────────────────
  ['cynthia.ndzi@student.com',  'UI/UX Design Intern', 'interview_scheduled',
    'I am applying for the UI/UX Design Internship. I have a keen eye for design and I have been learning Figma and user experience principles. I am excited to contribute to TechNova\'s product team.'],
  ['vanessa.ngwa@student.com',  'UI/UX Design Intern', 'under_review',
    'I am interested in the UI/UX Design Internship. While my primary expertise is in cybersecurity, I have a strong interest in UI design and have been developing design skills alongside my studies.'],
  ['sandra.neba@student.com',   'UI/UX Design Intern', 'submitted',
    'Applying for the UI/UX Design Internship. I have explored Figma and wireframing in my studies and I am eager to develop these skills further at TechNova.'],
  ['junior.fokou@student.com',  'UI/UX Design Intern', 'submitted',
    'I would like to apply for the UI/UX Design Internship. I am interested in user interface design and how it connects with the technical systems I study.'],

  // ── Other companies ───────────────────────────────────────────────────────
  ['junior.fokou@student.com',  'Network Support Technician Intern', 'under_review',
    'I am applying for the Network Support Technician Internship. My skills in Cisco, TCP/IP and Linux make me well-suited for this role.'],
  ['vanessa.ngwa@student.com',  'Network Support Technician Intern', 'submitted',
    'I would like to apply for the Network Support Technician Internship. My cybersecurity background includes network security and Linux administration.'],
  ['junior.fokou@student.com',  'IT Consulting & Support Intern', 'under_review',
    'Applying for the IT Support Internship at SmartSys Technologies. I have practical experience with network configuration and technical support.'],
  ['michael.tabi@student.com',  'Data Analyst Intern', 'under_review',
    'I am applying for the Data Analyst Internship. SQL, Python and data analysis are core to my Computer Science studies and I am ready to apply these skills professionally.'],
  ['cynthia.ndzi@student.com',  'Data Analyst Intern', 'under_review',
    'I am very excited to apply for the Data Analyst Internship at NexaSoft. Power BI, SQL and Excel are my primary tools and I have hands-on experience analysing real datasets.'],
  ['kevin.ndzi@student.com',    'Mobile App Developer Intern', 'submitted',
    'Applying for the Mobile App Developer Internship. I have strong JavaScript skills and I am eager to learn Flutter for cross-platform mobile development.'],
  ['michael.tabi@student.com',  'Mobile App Developer Intern', 'submitted',
    'I would like to apply for the Mobile App Developer Internship. I am confident my programming background will allow me to pick up Flutter quickly.'],
];

// [senderEmail, receiverEmail, studentEmail, offerTitle, content, minutesAgo]
const MESSAGES = [
  // Thread: Brenda ↔ TechNova — Frontend (accepted)
  ['brenda.nfor@student.com', 'hr@technova.cm',        'brenda.nfor@student.com', 'Frontend Developer Intern',
    'Good morning. I have submitted my application for the Frontend Developer Intern position. Please let me know if you need any additional information.',             4320],
  ['hr@technova.cm',          'brenda.nfor@student.com', 'brenda.nfor@student.com', 'Frontend Developer Intern',
    'Thank you for your application, Brenda. Your profile looks impressive. Our team is currently reviewing it and we will be in touch shortly.',                       4200],
  ['brenda.nfor@student.com', 'hr@technova.cm',          'brenda.nfor@student.com', 'Frontend Developer Intern',
    'Thank you. I look forward to hearing from you.',                                                                                                                    4100],
  ['hr@technova.cm',          'brenda.nfor@student.com', 'brenda.nfor@student.com', 'Frontend Developer Intern',
    'We are pleased to inform you that your application has been successful. Welcome to the TechNova team, Brenda! We will send you onboarding details soon.',          3000],

  // Thread: Kevin ↔ TechNova — Backend (accepted)
  ['kevin.ndzi@student.com',  'hr@technova.cm',          'kevin.ndzi@student.com',  'Backend Developer Intern',
    'Good day. I wanted to confirm receipt of my application for the Backend Developer Internship.',                                                                     2880],
  ['hr@technova.cm',          'kevin.ndzi@student.com',  'kevin.ndzi@student.com',  'Backend Developer Intern',
    'Hello Kevin, we have received your application. Our team is reviewing it and we will get back to you shortly.',                                                     2760],
  ['kevin.ndzi@student.com',  'hr@technova.cm',          'kevin.ndzi@student.com',  'Backend Developer Intern',
    'Thank you. I wanted to ask whether the internship position is onsite or if there is a remote option.',                                                              2700],
  ['hr@technova.cm',          'kevin.ndzi@student.com',  'kevin.ndzi@student.com',  'Backend Developer Intern',
    'The position is fully onsite at our Yaoundé office. We have reviewed your profile and we are pleased to offer you the Backend Developer Internship. Congratulations!', 2400],

  // Thread: Sandra ↔ TechNova — SE Intern
  ['sandra.neba@student.com', 'hr@technova.cm',          'sandra.neba@student.com', 'Software Engineering Intern',
    'Hello, I wanted to ask whether applications for the Software Engineering Internship are still open.',                                                               1440],
  ['hr@technova.cm',          'sandra.neba@student.com', 'sandra.neba@student.com', 'Software Engineering Intern',
    'Yes, applications are still open. We encourage you to complete your profile before the deadline to strengthen your application.',                                   1380],
  ['sandra.neba@student.com', 'hr@technova.cm',          'sandra.neba@student.com', 'Software Engineering Intern',
    'Thank you. I have just updated my profile. I look forward to your feedback.',                                                                                       1320],

  // Thread: Cynthia ↔ TechNova — UI/UX (interview scheduled)
  ['cynthia.ndzi@student.com','hr@technova.cm',          'cynthia.ndzi@student.com','UI/UX Design Intern',
    'Good morning. I submitted my application for the UI/UX Design Internship and I wanted to follow up on the status.',                                                  720],
  ['hr@technova.cm',          'cynthia.ndzi@student.com','cynthia.ndzi@student.com','UI/UX Design Intern',
    'Hello Cynthia, thank you for applying. We have reviewed your profile and would like to schedule an interview with you this week.',                                   660],
  ['cynthia.ndzi@student.com','hr@technova.cm',          'cynthia.ndzi@student.com','UI/UX Design Intern',
    'That is great news! I am available any day this week. Please let me know the time that works best for your team.',                                                   600],
];

// [recipientEmail, type, title, body, link (nullable)]
// Built dynamically in the script below from application/message data.
// Defined as a factory function so IDs are available at seed time.

// ── Helpers ────────────────────────────────────────────────────────────────────

function log(msg) { console.log(msg); }
function err(msg) { console.error(msg); }

async function safeDelete(table, column, value) {
  try {
    const q = value === '__all__'
      ? supabaseAdmin.from(table).delete().neq('id', NIL_UUID)
      : supabaseAdmin.from(table).delete().eq(column, value);
    const { error } = await q;
    if (error) err(`    ✖ delete ${table}: ${error.message}`);
  } catch (e) {
    err(`    ✖ delete ${table} (exception): ${e.message}`);
  }
}

async function safeDeleteIn(table, column, values) {
  if (!values.length) return;
  try {
    const { error } = await supabaseAdmin.from(table).delete().in(column, values);
    if (error) err(`    ✖ deleteIn ${table}: ${error.message}`);
  } catch (e) {
    err(`    ✖ deleteIn ${table} (exception): ${e.message}`);
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────

(async () => {
  log(`\n── InternBeacon Demo Seed ${APPLY ? '(APPLY)' : '(dry-run)'} ─────────────────────────────`);

  if (!APPLY) {
    log('\nThis is a dry-run — no data will be written.');
    log('Re-run with --apply to execute the migration.\n');
    log(`  Students to create  : ${STUDENTS.length}`);
    log(`  Companies to create : ${COMPANIES.length}`);
    log(`  Offers to create    : ${OFFERS.length}`);
    log(`  Applications        : ${APPLICATIONS.length}`);
    log(`  Messages            : ${MESSAGES.length}`);
    return;
  }

  // ── Phase 0: Identify admin accounts ──────────────────────────────────────
  log('\n[0] Identifying admin accounts...');
  const { data: authList, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) { err(`✖ Could not list users: ${listErr.message}`); process.exit(1); }

  const allAuthUsers  = authList?.users || [];
  const adminUserIds  = new Set(allAuthUsers.filter(u => u.app_metadata?.role === 'admin').map(u => u.id));
  log(`    Found ${adminUserIds.size} admin account(s) — will be preserved.`);

  // Collect non-admin user IDs currently in DB
  const { data: existingStudents } = await supabaseAdmin.from('student_profiles').select('user_id');
  const { data: existingCompanies } = await supabaseAdmin.from('company_profiles').select('user_id');
  const nonAdminUserIds = [
    ...(existingStudents || []).map(r => r.user_id),
    ...(existingCompanies || []).map(r => r.user_id),
  ].filter(id => !adminUserIds.has(id));

  // ── Phase 1: Cleanup ───────────────────────────────────────────────────────
  log('\n[1] Cleaning existing data...');

  // messages — no FK back to admin, safe to wipe all
  await safeDelete('messages', null, '__all__');
  log('    ✓ messages');

  // notifications — delete only for non-admin users
  if (nonAdminUserIds.length) {
    await safeDeleteIn('notifications', 'user_id', nonAdminUserIds);
  }
  log('    ✓ notifications');

  // application_status_history → applications (need app IDs first)
  const { data: existingApps } = await supabaseAdmin.from('applications').select('id');
  const existingAppIds = (existingApps || []).map(a => a.id);
  if (existingAppIds.length) {
    await safeDeleteIn('application_status_history', 'application_id', existingAppIds);
  }
  log('    ✓ application_status_history');

  // bookmarks
  await safeDelete('bookmarks', null, '__all__');
  log('    ✓ bookmarks');

  // applications
  await safeDelete('applications', null, '__all__');
  log('    ✓ applications');

  // internship_offers
  await safeDelete('internship_offers', null, '__all__');
  log('    ✓ internship_offers');

  // student_profiles and company_profiles
  await safeDelete('student_profiles', null, '__all__');
  await safeDelete('company_profiles', null, '__all__');
  log('    ✓ student_profiles, company_profiles');

  // Delete auth users (non-admin only)
  let deletedAuthCount = 0;
  for (const uid of nonAdminUserIds) {
    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(uid);
    if (delErr) err(`    ✖ deleteUser ${uid}: ${delErr.message}`);
    else deletedAuthCount++;
  }
  log(`    ✓ ${deletedAuthCount} auth users removed`);

  // ── Phase 2: Seed companies ────────────────────────────────────────────────
  log('\n[2] Creating company accounts...');
  const companyMap = {}; // companyName → { userId, profileId }
  const emailToUserId = {}; // email → userId (for all seeded users)

  for (const c of COMPANIES) {
    const { data: au, error: auErr } = await supabaseAdmin.auth.admin.createUser({
      email: c.email,
      password: PASSWORD,
      email_confirm: true,
      app_metadata:  { role: 'company' },
      user_metadata: { role: 'company', company_name: c.companyName },
    });
    if (auErr) { err(`    ✖ ${c.companyName} auth: ${auErr.message}`); continue; }

    const { data: prof, error: profErr } = await supabaseAdmin
      .from('company_profiles')
      .insert({
        user_id:       au.user.id,
        company_name:  c.companyName,
        sector:        c.sector,
        description:   c.description,
        city:          c.city,
        address:       c.address,
        phone:         c.phone,
        website_url:   c.websiteUrl,
        employee_size: c.employeeSize,
      })
      .select('id')
      .single();
    if (profErr) { err(`    ✖ ${c.companyName} profile: ${profErr.message}`); continue; }

    companyMap[c.companyName] = { userId: au.user.id, profileId: prof.id };
    emailToUserId[c.email]    = au.user.id;
    log(`    ✓ ${c.companyName}`);
  }

  // ── Phase 3: Seed students ─────────────────────────────────────────────────
  log('\n[3] Creating student accounts...');
  const studentMap = {}; // email → { userId, profileId, data }

  for (const s of STUDENTS) {
    const { data: au, error: auErr } = await supabaseAdmin.auth.admin.createUser({
      email:          s.email,
      password:       PASSWORD,
      email_confirm:  true,
      app_metadata:   { role: 'student' },
      user_metadata:  { first_name: s.firstName, last_name: s.lastName },
    });
    if (auErr) { err(`    ✖ ${s.firstName} ${s.lastName} auth: ${auErr.message}`); continue; }

    const { data: prof, error: profErr } = await supabaseAdmin
      .from('student_profiles')
      .insert({
        user_id:    au.user.id,
        first_name: s.firstName,
        last_name:  s.lastName,
        university: s.university,
        programme:  s.programme,
        study_year: s.studyYear,
        city:       s.city,
        languages:  s.languages,
        skills:     s.skills,
        bio:        s.bio,
      })
      .select('id')
      .single();
    if (profErr) { err(`    ✖ ${s.firstName} profile: ${profErr.message}`); continue; }

    studentMap[s.email]     = { userId: au.user.id, profileId: prof.id, data: s };
    emailToUserId[s.email]  = au.user.id;
    log(`    ✓ ${s.firstName} ${s.lastName} (${s.email})`);
  }

  // ── Phase 4: Seed offers ───────────────────────────────────────────────────
  log('\n[4] Creating internship offers...');
  const offerMap = {}; // `${companyName}::${title}` → offerId

  for (const o of OFFERS) {
    const company = companyMap[o.company];
    if (!company) { err(`    ✖ Company not found: ${o.company}`); continue; }

    const payload = {
      company_id:          company.profileId,
      title:               o.title,
      domain:              o.domain,
      location:            o.location,
      duration_weeks:      o.duration_weeks,
      is_paid:             o.is_paid,
      openings:            o.openings,
      deadline:            o.deadline,
      start_date:          o.start_date,
      required_skills:     o.required_skills,
      required_languages:  o.required_languages,
      requirements:        o.requirements,
      description:         o.description,
      status:              'open',
    };
    if (o.stipend_amount)   payload.stipend_amount   = o.stipend_amount;
    if (o.stipend_currency) payload.stipend_currency = o.stipend_currency;

    const { data: offer, error: offerErr } = await supabaseAdmin
      .from('internship_offers')
      .insert(payload)
      .select('id')
      .single();
    if (offerErr) { err(`    ✖ ${o.title}: ${offerErr.message}`); continue; }

    offerMap[`${o.company}::${o.title}`] = offer.id;
    log(`    ✓ [${o.company}] ${o.title}${o.is_paid ? ` — ${o.stipend_amount?.toLocaleString()} XAF/mo` : ' — unpaid'}`);
  }

  // ── Phase 5: Seed applications ─────────────────────────────────────────────
  log('\n[5] Creating applications...');
  const appMap = {}; // `${studentEmail}::${offerTitle}` → appId
  let appCount = 0;

  for (const [studentEmail, offerTitle, status, coverLetter] of APPLICATIONS) {
    const student = studentMap[studentEmail];
    if (!student) { err(`    ✖ Student not found: ${studentEmail}`); continue; }

    // Find offer by title across all companies
    let offerId = null;
    for (const [key, id] of Object.entries(offerMap)) {
      if (key.endsWith(`::${offerTitle}`)) { offerId = id; break; }
    }
    if (!offerId) { err(`    ✖ Offer not found: ${offerTitle}`); continue; }

    const s = student.data;
    const profileSnapshot = {
      firstName:  s.firstName,
      lastName:   s.lastName,
      university: s.university,
      programme:  s.programme,
      studyYear:  s.studyYear,
      skills:     s.skills,
      languages:  s.languages,
      bio:        s.bio,
      avatarUrl:  null,
      cvUrl:      null,
      snapshotAt: new Date().toISOString(),
    };

    const { data: app, error: appErr } = await supabaseAdmin
      .from('applications')
      .insert({
        offer_id:         offerId,
        student_id:       student.profileId,
        status,
        cover_letter:     coverLetter,
        profile_snapshot: profileSnapshot,
      })
      .select('id')
      .single();
    if (appErr) { err(`    ✖ ${studentEmail} → ${offerTitle}: ${appErr.message}`); continue; }

    appMap[`${studentEmail}::${offerTitle}`] = app.id;
    appCount++;
    log(`    ✓ ${studentEmail.split('@')[0].padEnd(22)} → ${offerTitle} [${status}]`);
  }

  // Mark accepted offers as filled
  const frontendId = offerMap['TechNova Cameroon::Frontend Developer Intern'];
  const backendId  = offerMap['TechNova Cameroon::Backend Developer Intern'];
  if (frontendId) await supabaseAdmin.from('internship_offers').update({ filled_count: 1 }).eq('id', frontendId);
  if (backendId)  await supabaseAdmin.from('internship_offers').update({ filled_count: 1 }).eq('id', backendId);

  // ── Phase 6: Seed messages ─────────────────────────────────────────────────
  log('\n[6] Creating messages...');
  let msgCount = 0;
  const now = Date.now();

  for (const [senderEmail, receiverEmail, studentEmail, offerTitle, content, minutesAgo] of MESSAGES) {
    const senderUserId   = emailToUserId[senderEmail];
    const receiverUserId = emailToUserId[receiverEmail];
    const appId          = appMap[`${studentEmail}::${offerTitle}`];

    if (!senderUserId)   { err(`    ✖ Sender not found: ${senderEmail}`);   continue; }
    if (!receiverUserId) { err(`    ✖ Receiver not found: ${receiverEmail}`); continue; }
    if (!appId)          { err(`    ✖ App not found: ${studentEmail}::${offerTitle}`); continue; }

    const { error: msgErr } = await supabaseAdmin.from('messages').insert({
      app_id:      appId,
      sender_id:   senderUserId,
      receiver_id: receiverUserId,
      content,
      sent_at:     new Date(now - minutesAgo * 60 * 1000).toISOString(),
      is_read:     true,
    });
    if (msgErr) { err(`    ✖ Message (${senderEmail}→${receiverEmail}): ${msgErr.message}`); continue; }
    msgCount++;
  }
  log(`    ✓ ${msgCount} messages created`);

  // ── Phase 7: Seed notifications ────────────────────────────────────────────
  log('\n[7] Creating notifications...');
  const techNovaUserId = companyMap['TechNova Cameroon']?.userId;

  const notifications = [
    // Student notifications — application submitted
    ...['brenda.nfor@student.com','kevin.ndzi@student.com','michael.tabi@student.com',
        'sandra.neba@student.com','junior.fokou@student.com','richcal@student.com'].map(email => ({
      user_id: emailToUserId[email],
      type: 'status_update',
      title: 'Application submitted',
      body: 'Your application to TechNova Cameroon has been submitted successfully.',
      link: '/applications',
    })).filter(n => n.user_id),

    // Status updates for students
    { user_id: emailToUserId['brenda.nfor@student.com'], type: 'status_update',
      title: 'Application under review', body: 'TechNova Cameroon is reviewing your application for Software Engineering Intern.', link: '/applications' },
    { user_id: emailToUserId['brenda.nfor@student.com'], type: 'status_update',
      title: 'Congratulations! You got the role!', body: 'Your application to TechNova Cameroon for Frontend Developer Intern has been accepted!', link: '/applications' },
    { user_id: emailToUserId['kevin.ndzi@student.com'], type: 'status_update',
      title: 'Interview scheduled', body: 'An interview has been scheduled for your Frontend Developer Intern application at TechNova Cameroon.', link: '/applications' },
    { user_id: emailToUserId['kevin.ndzi@student.com'], type: 'status_update',
      title: 'Congratulations! You got the role!', body: 'Your application to TechNova Cameroon for Backend Developer Intern has been accepted!', link: '/applications' },
    { user_id: emailToUserId['michael.tabi@student.com'], type: 'status_update',
      title: 'Application under review', body: 'TechNova Cameroon is reviewing your application for Software Engineering Intern.', link: '/applications' },
    { user_id: emailToUserId['michael.tabi@student.com'], type: 'status_update',
      title: 'Interview scheduled', body: 'An interview has been scheduled for your Backend Developer Intern application at TechNova Cameroon.', link: '/applications' },
    { user_id: emailToUserId['cynthia.ndzi@student.com'], type: 'status_update',
      title: 'Interview scheduled', body: 'An interview has been scheduled for your UI/UX Design Intern application at TechNova Cameroon.', link: '/applications' },

    // New message notifications
    { user_id: emailToUserId['brenda.nfor@student.com'], type: 'new_message',
      title: 'New message from TechNova Cameroon', body: 'TechNova Cameroon sent you a message regarding your application.', link: '/messages' },
    { user_id: emailToUserId['kevin.ndzi@student.com'], type: 'new_message',
      title: 'New message from TechNova Cameroon', body: 'TechNova Cameroon sent you a message regarding your application.', link: '/messages' },
    { user_id: emailToUserId['sandra.neba@student.com'], type: 'new_message',
      title: 'New message from TechNova Cameroon', body: 'TechNova Cameroon sent you a message regarding your application.', link: '/messages' },
    { user_id: emailToUserId['cynthia.ndzi@student.com'], type: 'new_message',
      title: 'New message from TechNova Cameroon', body: 'TechNova Cameroon sent you a message regarding your UI/UX Design Intern application.', link: '/messages' },

    // Company notifications (TechNova receives application alerts)
    ...[
      ['brenda.nfor@student.com','Software Engineering Intern'],
      ['kevin.ndzi@student.com', 'Software Engineering Intern'],
      ['michael.tabi@student.com','Software Engineering Intern'],
      ['sandra.neba@student.com','Software Engineering Intern'],
      ['junior.fokou@student.com','Software Engineering Intern'],
    ].map(([email, offer]) => ({
      user_id: techNovaUserId,
      type: 'new_application',
      title: 'New application received',
      body: `${studentMap[email]?.data.firstName} ${studentMap[email]?.data.lastName} has applied for ${offer}.`,
      link: '/applications',
    })).filter(n => n.user_id),
  ].filter(n => n.user_id); // guard: skip if user wasn't created

  let notifCount = 0;
  for (const n of notifications) {
    const { error: nErr } = await supabaseAdmin.from('notifications').insert(n);
    if (nErr) err(`    ✖ Notification (${n.type}): ${nErr.message}`);
    else notifCount++;
  }
  log(`    ✓ ${notifCount} notifications created`);

  // ── Summary ────────────────────────────────────────────────────────────────
  log('\n──────────────────────────────────────────────────────────────────────────');
  log('  DEMO SEED COMPLETE');
  log('──────────────────────────────────────────────────────────────────────────');
  log(`  Students created  : ${Object.keys(studentMap).length}`);
  log(`  Companies created : ${Object.keys(companyMap).length}`);
  log(`  Offers created    : ${Object.keys(offerMap).length}`);
  log(`  Applications      : ${appCount}`);
  log(`  Messages          : ${msgCount}`);
  log(`  Notifications     : ${notifCount}`);
  log('');
  log('  Demo credentials (all accounts):');
  log('    Password: Demo@2025');
  log('');
  log('  Hero company : hr@technova.cm');
  log('  Demo student : richcal@student.com  (no CV — apply live during defence)');
  log('');
  log('  Expected match ranking for Software Engineering Intern:');
  log('    1. Brenda Nfor   — 93  Excellent Match');
  log('    2. Kevin Ndzi    — 83  Good Match');
  log('    3. Michael Tabi  — 76  Good Match');
  log('    4. Sandra Neba   — 57  Moderate Match');
  log('    5. Junior Fokou  — 43  Low Match');
  log('  → After Richcal uploads CV2 (5/5 skills): score jumps to 100, rank #1');
  log('──────────────────────────────────────────────────────────────────────────\n');

})().catch(e => { console.error('\n✖ Seed failed:', e.message); process.exit(1); });
