const { body } = require('express-validator');

exports.registerRules = [
  body('email')
    .isEmail().withMessage('Valid email required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role')
    .isIn(['student', 'company']).withMessage('Role must be student or company'),

  // ── Student-only fields ────────────────────────────────────────────────────
  body('firstName')
    .if(body('role').equals('student'))
    .notEmpty().withMessage('First name is required'),
  body('lastName')
    .if(body('role').equals('student'))
    .notEmpty().withMessage('Last name is required'),
  body('university')
    .if(body('role').equals('student'))
    .notEmpty().withMessage('University is required'),
  body('programme')
    .if(body('role').equals('student'))
    .notEmpty().withMessage('Programme is required'),
  body('studyYear')
    .if(body('role').equals('student'))
    .isInt({ min: 1, max: 5 }).withMessage('Study year must be between 1 and 5'),

  // ── Company-only fields ────────────────────────────────────────────────────
  body('companyName')
    .if(body('role').equals('company'))
    .notEmpty().withMessage('Company name is required'),
  body('sector')
    .if(body('role').equals('company'))
    .notEmpty().withMessage('Sector is required'),
  body('city')
    .if(body('role').equals('company'))
    .notEmpty().withMessage('City is required'),
];

exports.loginRules = [
  body('email')
    .isEmail().withMessage('Valid email required')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

exports.forgotPasswordRules = [
  body('email')
    .isEmail().withMessage('Valid email required')
    .normalizeEmail(),
];

exports.refreshRules = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required'),
];

exports.resetPasswordRules = [
  body('access_token')
    .notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

exports.createOfferRules = [
  body('title').notEmpty().withMessage('Title is required'),
  body('domain').notEmpty().withMessage('Domain is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('durationWeeks')
    .notEmpty().withMessage('Duration (weeks) is required')
    .isInt({ min: 1, max: 104 }).withMessage('Duration must be between 1 and 104 weeks'),
  body('deadline')
    .notEmpty().withMessage('Deadline is required')
    .isISO8601().withMessage('Deadline must be a valid date')
    .custom(v => { if (new Date(v) <= new Date()) throw new Error('Deadline must be in the future'); return true; }),
  body('isPaid')
    .optional()
    .isBoolean().withMessage('isPaid must be a boolean'),
  body('stipendAmount')
    .optional()
    .isNumeric().withMessage('Stipend amount must be a number'),
  body('openings')
    .optional()
    .isInt({ min: 1 }).withMessage('Openings must be at least 1'),
  body('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid date'),
  body('status')
    .optional()
    .isIn(['draft', 'open']).withMessage('Status must be draft or open'),
  body('requiredSkills')
    .optional()
    .isArray().withMessage('requiredSkills must be an array of strings'),
  body('requiredLanguages')
    .optional()
    .isArray().withMessage('requiredLanguages must be an array of strings')
    .custom(v => v.every(l => typeof l === 'string')).withMessage('requiredLanguages must contain only strings'),
];

exports.updateOfferRules = [
  body('durationWeeks')
    .optional()
    .isInt({ min: 1, max: 104 }).withMessage('Duration must be between 1 and 104 weeks'),
  body('openings')
    .optional()
    .isInt({ min: 1 }).withMessage('Openings must be at least 1'),
  body('isPaid')
    .optional()
    .isBoolean().withMessage('isPaid must be a boolean'),
  body('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid date'),
  body('status')
    .optional()
    .isIn(['draft', 'open', 'closed']).withMessage('Status must be draft, open, or closed'),
  body('requiredSkills')
    .optional()
    .isArray().withMessage('requiredSkills must be an array of strings'),
  body('requiredLanguages')
    .optional()
    .isArray().withMessage('requiredLanguages must be an array of strings')
    .custom(v => v.every(l => typeof l === 'string')).withMessage('requiredLanguages must contain only strings'),
];

exports.applyRules = [
  body('offerId').notEmpty().withMessage('Offer ID is required').isUUID().withMessage('Invalid offer ID'),
  body('coverLetter')
    .optional()
    .isString()
    .isLength({ max: 2000 }).withMessage('Cover letter must be 2000 characters or fewer'),
  body('cvSnapshotUrl').optional().isString().trim(),
];

const COMPANY_STATUSES = [
  'under_review', 'shortlisted',
  'interview_scheduled', 'interview_completed', 'final_review',
  'accepted', 'rejected',
];

exports.updateStatusRules = [
  body('status')
    .isIn(COMPANY_STATUSES)
    .withMessage(`Status must be one of: ${COMPANY_STATUSES.join(', ')}`),
  body('companyNote').optional().isString(),
  body('interviewDate')
    .optional().isISO8601().withMessage('interviewDate must be a valid ISO date'),
  body('interviewType')
    .optional()
    .isIn(['in_person', 'google_meet', 'zoom', 'teams', 'phone', 'in_app_video'])
    .withMessage('interviewType must be: in_person, google_meet, zoom, teams, phone, or in_app_video'),
  body('interviewLocation').optional().isString().trim(),
  body('interviewLink')
    .optional().isURL().withMessage('interviewLink must be a valid URL'),
  body('interviewNotes').optional().isString().trim(),
];
