import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Briefcase, MapPin, Banknote, X } from 'lucide-react';
import { offersApi } from '../../api/offers';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import SelectField from '../../components/ui/SelectField';

// Preserve this form's existing 10px select dimensions when using the shared
// SelectField, so migrating in the chevron/handlers introduces no visual change.
const SELECT_DIMS = { borderRadius: '10px', padding: '10px 38px 10px 14px' };
import toast from 'react-hot-toast';
import { OFFER_LOCATIONS } from '../../constants/locations';

const DOMAINS    = ['Information Technology', 'Finance & Banking', 'Telecommunications', 'Marketing & Sales', 'Engineering', 'Human Resources', 'Legal', 'Healthcare', 'Agriculture', 'Other'];
const LOCATIONS  = OFFER_LOCATIONS;
const DURATIONS  = [4, 8, 12, 16, 24];
const CURRENCIES = ['XAF', 'USD', 'EUR'];
const LANGUAGES  = ['English', 'French'];

export default function EditOffer() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const { data: offer, isLoading, isError } = useQuery({
    queryKey: ['offer', id],
    queryFn:  () => offersApi.getOne(id).then(r => r.data.data),
  });

  const qc = useQueryClient();
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm();
  const [skills,     setSkills]     = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [languages,  setLanguages]  = useState([]);
  const isPaid = watch('isPaid');

  useEffect(() => {
    if (!offer) return;
    setSkills(offer.requiredSkills || []);
    setLanguages(offer.requiredLanguages || []);
    reset({
      title:            offer.title            || '',
      domain:           offer.domain           || '',
      description:      offer.description      || '',
      responsibilities: offer.responsibilities  || '',
      requirements:     offer.requirements     || '',
      location:         offer.location         || '',
      durationWeeks:    offer.durationWeeks    || '',
      openings:         offer.openings         || 1,
      deadline:         offer.deadline         ? offer.deadline.slice(0, 10) : '',
      startDate:        offer.startDate        ? offer.startDate.slice(0, 10) : '',
      isPaid:           offer.isPaid           || false,
      stipendAmount:    offer.stipendAmount    || '',
      stipendCurrency:  offer.stipendCurrency  || 'XAF',
    });
  }, [offer, reset]);

  const toggleLanguage = (lang) =>
    setLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);

  const addSkill = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) { setSkillInput(''); return; }
    const lc = trimmed.toLowerCase();
    const asLanguage = LANGUAGES.find(l => l.toLowerCase() === lc);
    if (asLanguage) {
      setLanguages(prev => prev.includes(asLanguage) ? prev : [...prev, asLanguage]);
      toast(`"${trimmed}" looks like a language — added it to Required Languages instead.`);
      setSkillInput('');
      return;
    }
    if (!skills.some(s => s.toLowerCase() === lc)) setSkills(prev => [...prev, trimmed]);
    setSkillInput('');
  };

  const handleSkillKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(skillInput); }
    else if (e.key === 'Backspace' && !skillInput && skills.length) setSkills(prev => prev.slice(0, -1));
  };

  const removeSkill = (skill) => setSkills(prev => prev.filter(s => s !== skill));

  const onSubmit = async (data) => {
    const allSkills = skillInput.trim()
      ? [...skills, ...skillInput.split(',').map(s => s.trim()).filter(Boolean)]
      : skills;
    const paid   = data.isPaid === true || data.isPaid === 'true';
    const amount = paid && data.stipendAmount ? Number(data.stipendAmount) : undefined;
    if (paid && (!amount || isNaN(amount))) { toast.error('Please enter a stipend amount for paid internships'); return; }
    try {
      await offersApi.update(id, {
        title:            data.title,
        domain:           data.domain,
        description:      data.description,
        responsibilities: data.responsibilities || undefined,
        requirements:     data.requirements     || undefined,
        location:         data.location,
        durationWeeks:    Number(data.durationWeeks),
        openings:         Number.isFinite(data.openings) && data.openings >= 1 ? data.openings : undefined,
        deadline:         data.deadline,
        startDate:        data.startDate || undefined,
        isPaid:           paid,
        stipendAmount:    amount,
        stipendCurrency:  paid ? (data.stipendCurrency || 'XAF') : undefined,
        requiredSkills:    allSkills,
        requiredLanguages: languages,
      });
      qc.invalidateQueries({ queryKey: ['my-offers'] });
      qc.invalidateQueries({ queryKey: ['offer', id] });
      toast.success('Offer updated!');
      navigate('/company/offers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update offer');
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (isError || !offer) return <p className="text-sm" style={{ color: '#9A9E97' }}>Offer not found.</p>;

  return (
    <div className="max-w-2xl space-y-5" style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
      <div>
        <h2 className="text-2xl font-black" style={{ color: '#1B1D1A' }}>Edit Internship</h2>
        <p className="text-sm mt-0.5" style={{ color: '#9A9E97' }}>{offer.title}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormSection title="Basic Information" icon={Briefcase}>
          <Field label="Internship Title *" error={errors.title?.message}
            {...register('title', { required: 'Title is required' })}
            placeholder="e.g. Software Development Intern" />

          <SelectField label="Domain *" error={errors.domain?.message} style={SELECT_DIMS}
            {...register('domain', { required: 'Domain is required' })}>
            <option value="">Select domain…</option>
            {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
          </SelectField>

          <Textarea label="Description *" rows={5} placeholder="Describe the internship role…"
            error={errors.description?.message}
            {...register('description', { required: 'Description is required' })} />
          <Textarea label="Responsibilities" rows={3} placeholder="Key responsibilities for this role…"
            {...register('responsibilities')} />
          <Textarea label="Requirements" rows={3} placeholder="Candidate requirements and qualifications…"
            {...register('requirements')} />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium" style={{ color: '#6B6F69' }}>Required Skills</label>
            <div className="min-h-[46px] flex flex-wrap items-center gap-2 rounded-xl px-3 py-2 transition-colors"
              style={{ background: '#F6F5F1', border: '1px solid #DDDBD2' }}>
              {skills.map(skill => (
                <span key={skill} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{ background: '#1E5B45', color: '#fff' }}>
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="ml-0.5 opacity-70 hover:opacity-100">
                    <X size={11} />
                  </button>
                </span>
              ))}
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKey}
                onBlur={() => skillInput.trim() && addSkill(skillInput)}
                placeholder={skills.length ? '' : 'JavaScript, React, SQL… (Enter or comma to add)'}
                className="flex-1 min-w-[140px] bg-transparent text-sm focus:outline-none py-0.5"
                style={{ color: '#1B1D1A' }} />
            </div>
            <p className="text-[11px]" style={{ color: '#C0BFBA' }}>Press Enter or comma to add each skill</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium" style={{ color: '#6B6F69' }}>Required Languages</label>
            <div className="flex gap-2">
              {LANGUAGES.map(lang => {
                const active = languages.includes(lang);
                return (
                  <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                    style={active
                      ? { background: '#1E5B45', color: '#fff', borderColor: '#1E5B45' }
                      : { background: '#F6F5F1', color: '#1B1D1A', borderColor: '#DDDBD2' }}>
                    {lang}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px]" style={{ color: '#C0BFBA' }}>Scored separately from technical skills — only select a language if it's genuinely required.</p>
          </div>
        </FormSection>

        <FormSection title="Logistics" icon={MapPin}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField label="Location *" error={errors.location?.message} style={SELECT_DIMS}
              {...register('location', { required: 'Location is required' })}>
              <option value="">Select city…</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </SelectField>
            <SelectField label="Duration (weeks) *" error={errors.durationWeeks?.message} style={SELECT_DIMS}
              {...register('durationWeeks', { required: 'Duration is required' })}>
              <option value="">Select…</option>
              {DURATIONS.map(d => <option key={d} value={d}>{d} weeks</option>)}
            </SelectField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Number of Openings" type="number" min="1" {...register('openings', { min: 1, valueAsNumber: true })} />
            <Field label="Application Deadline *" type="date" error={errors.deadline?.message}
              {...register('deadline', { required: 'Deadline is required' })} />
          </div>
          <Field label="Preferred Start Date" type="date" {...register('startDate')} />
        </FormSection>

        <FormSection title="Compensation" icon={Banknote}>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-[#1E5B45]" {...register('isPaid')} />
            <span className="text-sm" style={{ color: '#1B1D1A' }}>This is a paid internship</span>
          </label>

          {isPaid && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <Field label="Stipend Amount (per month)" type="number" {...register('stipendAmount')} placeholder="50000" />
              <SelectField label="Currency" style={SELECT_DIMS} {...register('stipendCurrency')}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </SelectField>
            </div>
          )}
        </FormSection>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" variant="primary" size="lg" loading={isSubmitting}>
            Save Changes
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => navigate('/company/offers')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

function FormSection({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', border: '1px solid #E7E6DF' }}>
      <div className="flex items-center gap-2">
        <Icon size={16} style={{ color: '#1E5B45' }} />
        <h3 className="font-semibold text-sm" style={{ color: '#1B1D1A' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, error, onFocus, onBlur, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium" style={{ color: '#6B6F69' }}>{label}</label>}
      <input style={{ background: '#F6F5F1', border: '1px solid #DDDBD2', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', color: '#1B1D1A', width: '100%', outline: 'none', colorScheme: 'light' }}
        {...props}
        onFocus={e => { e.target.style.borderColor = '#1E5B45'; onFocus?.(e); }}
        onBlur={e => { e.target.style.borderColor = '#DDDBD2'; onBlur?.(e); }} />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Textarea({ label, error, onFocus, onBlur, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium" style={{ color: '#6B6F69' }}>{label}</label>}
      <textarea style={{ background: '#F6F5F1', border: '1px solid #DDDBD2', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', color: '#1B1D1A', width: '100%', outline: 'none', resize: 'none' }}
        {...props}
        onFocus={e => { e.target.style.borderColor = '#1E5B45'; onFocus?.(e); }}
        onBlur={e => { e.target.style.borderColor = '#DDDBD2'; onBlur?.(e); }} />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
