/**
 * InternBeacon — Extra Sectors Seed
 * Adds 4 non-tech companies + 6 diverse internship offers across Finance,
 * Accounting, Marketing, Legal, HR and Engineering domains.
 *
 * Safe to run after seed-demo.js — does NOT touch existing data.
 *
 * Usage:
 *   node scripts/seed-extra-offers.js           # dry-run
 *   node scripts/seed-extra-offers.js --apply   # execute
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { supabaseAdmin } = require('../src/config/supabase');

const APPLY    = process.argv.includes('--apply');
const PASSWORD = 'Demo@2025';

// ── New companies ──────────────────────────────────────────────────────────────

const COMPANIES = [
  {
    companyName:  'CamBank Financial Services',
    email:        'careers@cambank.cm',
    sector:       'Finance & Banking',
    city:         'Douala',
    address:      'Bonanjo, Douala, Cameroon',
    phone:        '+237 233 100 001',
    websiteUrl:   'https://www.cambank.cm',
    employeeSize: '51-200',
    description:  'CamBank Financial Services is a leading Cameroonian financial institution offering retail banking, corporate credit and investment services. The bank is committed to supporting the next generation of finance professionals through structured internship programmes.',
  },
  {
    companyName:  'Expertise Comptable Cameroun',
    email:        'rh@ecc-audit.cm',
    sector:       'Accounting & Audit',
    city:         'Yaoundé',
    address:      'Bastos, Yaoundé, Cameroon',
    phone:        '+237 222 100 002',
    websiteUrl:   'https://www.ecc-audit.cm',
    employeeSize: '11-50',
    description:  'Expertise Comptable Cameroun (ECC) is an accounting and audit firm providing financial auditing, tax advisory and management consulting services to SMEs and public institutions across Cameroon.',
  },
  {
    companyName:  'Brand Connect Cameroon',
    email:        'hr@brandconnect.cm',
    sector:       'Marketing & Sales',
    city:         'Douala',
    address:      'Akwa, Douala, Cameroon',
    phone:        '+237 233 100 003',
    websiteUrl:   'https://www.brandconnect.cm',
    employeeSize: '11-50',
    description:  'Brand Connect Cameroon is a full-service marketing and communications agency specializing in brand strategy, digital marketing, social media management and market research for Cameroonian and regional brands.',
  },
  {
    companyName:  'LexAfrique Cameroon',
    email:        'internships@lexafrique.cm',
    sector:       'Legal & Compliance',
    city:         'Yaoundé',
    address:      'Centre-ville, Yaoundé, Cameroon',
    phone:        '+237 222 100 004',
    websiteUrl:   'https://www.lexafrique.cm',
    employeeSize: '11-50',
    description:  'LexAfrique Cameroon is a business law firm specializing in corporate law, contract drafting, regulatory compliance and commercial litigation. The firm advises multinationals, SMEs and public entities operating in Cameroon and the OHADA zone.',
  },
];

// ── New offers ─────────────────────────────────────────────────────────────────

const OFFERS = [
  // ── Finance & Banking ─────────────────────────────────────────────────────
  {
    company:            'CamBank Financial Services',
    title:              'Finance & Credit Analyst Intern',
    domain:             'Finance & Banking',
    location:           'Douala',
    duration_weeks:     12,
    is_paid:            true,
    stipend_amount:     80000,
    stipend_currency:   'XAF',
    openings:           2,
    deadline:           '2026-09-30',
    start_date:         '2026-10-15',
    required_skills:    ['Financial Analysis', 'Excel', 'SQL', 'Finance', 'Statistics'],
    required_languages: ['English', 'French'],
    requirements:       'Undergraduate students in Finance, Banking, Economics or Accounting in Year 3 (Licence 3) or above. Bilingual (English and French) required. Strong analytical and numerical aptitude expected.',
    description:        'CamBank Financial Services is seeking a Finance & Credit Analyst Intern to support our corporate credit team. You will assist in financial statement analysis, credit risk assessment and loan portfolio monitoring under the supervision of senior analysts.',
  },
  {
    company:            'CamBank Financial Services',
    title:              'Banking Operations Intern',
    domain:             'Finance & Banking',
    location:           'Douala',
    duration_weeks:     8,
    is_paid:            true,
    stipend_amount:     60000,
    stipend_currency:   'XAF',
    openings:           3,
    deadline:           '2026-08-31',
    start_date:         '2026-09-15',
    required_skills:    ['Excel', 'Finance', 'Microsoft Office', 'Statistics'],
    required_languages: ['English', 'French'],
    requirements:       'Undergraduate students Year 2 or above studying Finance, Banking, Management or related fields. Both English and French are required for customer interaction.',
    description:        'Join CamBank Financial Services as a Banking Operations Intern and gain exposure to daily banking operations including customer account management, transaction processing and compliance documentation.',
  },

  // ── Accounting & Audit ────────────────────────────────────────────────────
  {
    company:            'Expertise Comptable Cameroun',
    title:              'Accounting & Audit Intern',
    domain:             'Accounting & Audit',
    location:           'Yaoundé',
    duration_weeks:     10,
    is_paid:            true,
    stipend_amount:     55000,
    stipend_currency:   'XAF',
    openings:           2,
    deadline:           '2026-09-15',
    start_date:         '2026-10-01',
    required_skills:    ['Accounting', 'Excel', 'Financial Analysis', 'Microsoft Office'],
    required_languages: ['French', 'English'],
    requirements:       'Students in Accounting, Finance, Audit or related disciplines, Year 3 or above. French proficiency is mandatory. English is a strong advantage.',
    description:        'ECC is recruiting Accounting & Audit Interns to work alongside our audit teams on client engagements. You will assist in preparing working papers, reconciling accounts, reviewing financial statements and supporting statutory audits.',
  },

  // ── Marketing & Sales ─────────────────────────────────────────────────────
  {
    company:            'Brand Connect Cameroon',
    title:              'Digital Marketing Intern',
    domain:             'Marketing & Sales',
    location:           'Douala',
    duration_weeks:     8,
    is_paid:            true,
    stipend_amount:     45000,
    stipend_currency:   'XAF',
    openings:           2,
    deadline:           '2026-09-01',
    start_date:         '2026-09-15',
    required_skills:    ['Social Media', 'Content Creation', 'Canva', 'Marketing', 'Copywriting'],
    required_languages: ['English', 'French'],
    requirements:       'Students in Marketing, Communication, Management or related fields, Year 2 or above. Must be creative with strong written communication skills in both English and French.',
    description:        'Brand Connect Cameroon is looking for a Digital Marketing Intern to support social media management, content creation and campaign analytics across client accounts. You will create posts, track engagement metrics and assist with market research.',
  },

  // ── Legal & Compliance ────────────────────────────────────────────────────
  {
    company:            'LexAfrique Cameroon',
    title:              'Legal Research & Compliance Intern',
    domain:             'Legal & Compliance',
    location:           'Yaoundé',
    duration_weeks:     12,
    is_paid:            false,
    openings:           1,
    deadline:           '2026-09-30',
    start_date:         '2026-10-15',
    required_skills:    ['Documentation', 'Microsoft Office', 'Excel'],
    required_languages: ['French', 'English'],
    requirements:       'Law students or students in related legal disciplines in Year 3 (Licence 3) or above. Strong legal research and writing skills required. French is the primary working language; English is required.',
    description:        'LexAfrique Cameroon is seeking a Legal Research & Compliance Intern to support our legal team. You will research OHADA commercial law, assist with contract drafting, prepare legal memoranda and support compliance reviews for client engagements.',
  },

  // ── Human Resources ───────────────────────────────────────────────────────
  {
    company:            'Brand Connect Cameroon',
    title:              'Human Resources Intern',
    domain:             'Human Resources',
    location:           'Douala',
    duration_weeks:     8,
    is_paid:            false,
    openings:           1,
    deadline:           '2026-08-31',
    start_date:         '2026-09-15',
    required_skills:    ['Microsoft Office', 'Excel', 'Documentation'],
    required_languages: ['English', 'French'],
    requirements:       'Students in Human Resources, Management, Business Administration or related fields, Year 2 or above. Bilingual (English and French) required.',
    description:        'Brand Connect Cameroon is recruiting an HR Intern to support our people operations team. Responsibilities include assisting with recruitment coordination, maintaining employee records, onboarding administration and HR reporting.',
  },
];

// ── Main ───────────────────────────────────────────────────────────────────────

(async () => {
  console.log(`\n── Extra Sectors Seed ${APPLY ? '(APPLY)' : '(dry-run)'} ─────────────────────────────`);

  if (!APPLY) {
    console.log('\nDry-run — no writes. Re-run with --apply to execute.\n');
    console.log(`  Companies to add : ${COMPANIES.length}`);
    console.log(`  Offers to add    : ${OFFERS.length}`);
    return;
  }

  // ── Create companies ───────────────────────────────────────────────────────
  console.log('\n[1] Creating companies...');
  const companyMap = {}; // companyName → profileId

  for (const c of COMPANIES) {
    // Skip if email already exists
    const { data: existing } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const alreadyExists = (existing?.users || []).some(u => u.email === c.email);
    if (alreadyExists) { console.log(`    ⚠ ${c.companyName} already exists — skipping`); continue; }

    const { data: au, error: auErr } = await supabaseAdmin.auth.admin.createUser({
      email:         c.email,
      password:      PASSWORD,
      email_confirm: true,
      app_metadata:  { role: 'company' },
      user_metadata: { role: 'company', company_name: c.companyName },
    });
    if (auErr) { console.error(`    ✖ ${c.companyName} auth: ${auErr.message}`); continue; }

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
    if (profErr) { console.error(`    ✖ ${c.companyName} profile: ${profErr.message}`); continue; }

    companyMap[c.companyName] = prof.id;
    console.log(`    ✓ ${c.companyName} (${c.email})`);
  }

  // ── Create offers ──────────────────────────────────────────────────────────
  console.log('\n[2] Creating offers...');
  let offerCount = 0;

  for (const o of OFFERS) {
    const companyProfileId = companyMap[o.company];
    if (!companyProfileId) { console.error(`    ✖ Company not in map: ${o.company}`); continue; }

    const payload = {
      company_id:         companyProfileId,
      title:              o.title,
      domain:             o.domain,
      location:           o.location,
      duration_weeks:     o.duration_weeks,
      is_paid:            o.is_paid,
      openings:           o.openings,
      deadline:           o.deadline,
      start_date:         o.start_date,
      required_skills:    o.required_skills,
      required_languages: o.required_languages,
      requirements:       o.requirements,
      description:        o.description,
      status:             'open',
    };
    if (o.stipend_amount)   payload.stipend_amount   = o.stipend_amount;
    if (o.stipend_currency) payload.stipend_currency = o.stipend_currency;

    const { error } = await supabaseAdmin.from('internship_offers').insert(payload);
    if (error) { console.error(`    ✖ ${o.title}: ${error.message}`); continue; }

    const paid = o.is_paid ? `${o.stipend_amount?.toLocaleString()} XAF/mo` : 'unpaid';
    console.log(`    ✓ [${o.company}] ${o.title} — ${paid}`);
    offerCount++;
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n──────────────────────────────────────────────────────────────');
  console.log('  EXTRA SECTORS SEED COMPLETE');
  console.log('──────────────────────────────────────────────────────────────');
  console.log(`  Companies added : ${Object.keys(companyMap).length}`);
  console.log(`  Offers added    : ${offerCount}`);
  console.log('');
  console.log('  New company credentials (all use Demo@2025):');
  for (const c of COMPANIES) console.log(`    ${c.email.padEnd(32)} ${c.companyName}`);
  console.log('──────────────────────────────────────────────────────────────\n');

})().catch(e => { console.error('\n✖ Failed:', e.message); process.exit(1); });
