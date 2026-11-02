import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Award,
  BookOpen,
  DollarSign,
  MapPin,
  CheckCircle,
  AlertCircle,
  XCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  Building,
  GraduationCap,
  Search,
  Sliders,
  RotateCcw,
  Zap,
  Tag,
  Share2,
  Info
} from 'lucide-react';
import LeadApprovalModal from '../components/LeadApprovalModal';
import GlowingScoreRing from '../components/GlowingScoreRing';
import ImportProfileCard from '../components/ImportProfileCard';

const PRESETS = [
  {
    name: "Computer Vision & Robotics",
    country: "Germany",
    degree: "Master of Science",
    cgpa: 3.65,
    ielts: 7.5,
    interests: "Computer Vision, Deep Learning, Edge AI, Autonomous Systems",
    skills: "Python, PyTorch, C++, ROS, Embedded ML",
    funding: true
  },
  {
    name: "Generative AI & Perception",
    country: "Switzerland",
    degree: "Master of Science",
    cgpa: 3.75,
    ielts: 7.5,
    interests: "Generative AI, Foundation Models, Machine Intelligence, Neural Rendering",
    skills: "PyTorch, Python, CUDA, Transformers, JAX",
    funding: true
  },
  {
    name: "Edge AI & Embedded ML",
    country: "Canada",
    degree: "Master of Mathematics",
    cgpa: 3.55,
    ielts: 7.0,
    interests: "Edge AI, TinyML, Operational AI, Efficient Neural Networks",
    skills: "C++, Python, Embedded ML, TinyML, TensorFlow",
    funding: true
  },
  {
    name: "3D Vision & Graphics",
    country: "Canada",
    degree: "Master of Science",
    cgpa: 3.60,
    ielts: 7.0,
    interests: "3D Computer Vision, Neural Graphics, Autonomous Vehicles, Generative AI",
    skills: "Python, PyTorch, 3D Reconstruction, C++",
    funding: true
  }
];

export default function DiscoveryMatchPage({ user }) {
  // Student Criteria Input State
  const [cgpa, setCgpa] = useState(3.65);
  const [ielts, setIelts] = useState(7.5);
  const [degree, setDegree] = useState('Master of Science');
  const [country, setCountry] = useState('Germany');
  const [researchInterests, setResearchInterests] = useState('Computer Vision, Deep Learning, Edge AI, Autonomous Systems');
  const [skills, setSkills] = useState('Python, PyTorch, C++, ROS, Embedded ML');
  const [requiresFunding, setRequiresFunding] = useState(true);

  // Search and Filter State
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Match Candidates State
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [approvedLead, setApprovedLead] = useState(null);
  const [approvingProfId, setApprovingProfId] = useState(null);

  useEffect(() => {
    runMatching();
  }, []);

  const runMatching = async (overrideParams = null) => {
    setLoading(true);
    setError('');

    const payload = {
      cgpa: parseFloat(overrideParams?.cgpa ?? cgpa),
      ieltsScore: (overrideParams?.ielts ?? ielts) ? parseFloat(overrideParams?.ielts ?? ielts) : null,
      degree: overrideParams?.degree ?? degree,
      targetCountry: overrideParams?.country ?? country,
      researchInterests: overrideParams?.interests ?? researchInterests,
      skills: overrideParams?.skills ?? skills,
      requiresFunding: overrideParams?.funding ?? requiresFunding
    };

    try {
      const res = await fetch('/api/v1/matches/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Match engine returned HTTP ${res.status}. Is the backend API running on port 5000?`);
      }

      const data = await res.json();
      setCandidates(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset) => {
    setCgpa(preset.cgpa);
    setIelts(preset.ielts);
    setDegree(preset.degree);
    setCountry(preset.country);
    setResearchInterests(preset.interests);
    setSkills(preset.skills);
    setRequiresFunding(preset.funding);
    runMatching(preset);
  };

  const handleProfileImported = (result) => {
    setCandidates(result.results || []);
    setError('');
  };

  const handleApproveLead = async (candidate) => {
    setApprovingProfId(candidate.professorId);
    try {
      const res = await fetch(`/api/v1/shortlist/${candidate.professorId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professorId: candidate.professorId,
          studentId: user?.id || 'demo-student-id',
          studentEmail: user?.email || 'student@gradpath.ai'
        })
      });

      if (!res.ok) throw new Error('Failed to approve lead');
      const leadData = await res.json();
      setApprovedLead(leadData);
    } catch (err) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setApprovingProfId(null);
    }
  };

  const getEligibilityBadge = (status) => {
    switch (status) {
      case 0:
      case 'ELIGIBLE':
        return <span className="badge-neon-green">● ELIGIBLE</span>;
      case 1:
      case 'NEEDS_REVIEW':
        return <span className="badge-neon-amber">▲ NEEDS REVIEW</span>;
      case 2:
      case 'INELIGIBLE':
      default:
        return <span className="badge-neon-rose">✕ INELIGIBLE</span>;
    }
  };

  const filteredCandidates = candidates.filter(c => {
    if (statusFilter === 'ELIGIBLE' && c.eligibility !== 0 && c.eligibility !== 'ELIGIBLE') return false;
    if (statusFilter === 'REVIEW' && c.eligibility !== 1 && c.eligibility !== 'NEEDS_REVIEW') return false;
    if (statusFilter === 'INELIGIBLE' && c.eligibility !== 2 && c.eligibility !== 'INELIGIBLE') return false;

    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      c.professorName.toLowerCase().includes(q) ||
      c.universityName.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.researchArea.toLowerCase().includes(q) ||
      c.researchKeywords.some(k => k.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.75rem 2rem' }}>
      <ImportProfileCard onProfileImported={handleProfileImported} />
      
      {/* Hero Quick Presets Bar */}
      <div className="glass-panel" style={{
        padding: '0.85rem 1.25rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(99, 102, 241, 0.2))',
            padding: '0.35rem 0.5rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: '#38BDF8',
            fontWeight: 700,
            fontSize: '0.82rem'
          }}>
            <Zap size={15} />
            <span>Preset Profiles</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Click to auto-populate criteria and run matching:</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => applyPreset(p)}
              className="btn-glass-secondary"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.75rem', alignItems: 'start' }}>
        
        {/* Left: Input Criteria Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sliders size={18} color="#38BDF8" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F9FAFB', letterSpacing: '-0.02em' }}>
                Profile Parameters
              </h2>
            </div>
            <button
              onClick={() => runMatching()}
              title="Reset to default criteria"
              className="btn-glass-secondary"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            >
              <RotateCcw size={13} />
              Re-run
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); runMatching(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* CGPA Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Cumulative GPA</label>
                <span style={{ fontSize: '0.9rem', color: '#38BDF8', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>
                  {cgpa.toFixed(2)} / 4.00
                </span>
              </div>
              <input
                type="range"
                min="2.5"
                max="4.0"
                step="0.05"
                value={cgpa}
                onChange={(e) => setCgpa(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#38BDF8', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748B', marginTop: '0.15rem' }}>
                <span>2.50 Min</span>
                <span>3.25 Median</span>
                <span>4.00 Max</span>
              </div>
            </div>

            {/* IELTS Score */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>IELTS Band Score</label>
                <span style={{ fontSize: '0.85rem', color: '#34D399', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>
                  {ielts ? `${ielts.toFixed(1)} Band` : 'Not Taken'}
                </span>
              </div>
              <input
                type="number"
                min="5.0"
                max="9.0"
                step="0.5"
                value={ielts}
                onChange={(e) => setIelts(e.target.value ? parseFloat(e.target.value) : '')}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem',
                  backgroundColor: 'rgba(3, 7, 18, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.6rem',
                  color: '#F9FAFB',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Degree Objective */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Target Degree
              </label>
              <select
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem',
                  backgroundColor: 'rgba(3, 7, 18, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.6rem',
                  color: '#F9FAFB',
                  fontSize: '0.85rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Master of Science">Master of Science (M.Sc.)</option>
                <option value="Master of Mathematics">Master of Mathematics (MMath)</option>
                <option value="Ph.D. / Doctoral">Ph.D. / Doctoral</option>
              </select>
            </div>

            {/* Target Country */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Preferred Region / Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem',
                  backgroundColor: 'rgba(3, 7, 18, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.6rem',
                  color: '#F9FAFB',
                  fontSize: '0.85rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Germany">Germany (TUM)</option>
                <option value="Switzerland">Switzerland (ETH Zurich)</option>
                <option value="United Kingdom">United Kingdom (Oxford)</option>
                <option value="United States">United States (MIT)</option>
                <option value="Canada">Canada (Waterloo / U of T)</option>
                <option value="Any">Any / Worldwide</option>
              </select>
            </div>

            {/* Research Interests */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Research Interests & Topics
              </label>
              <textarea
                rows="2"
                value={researchInterests}
                onChange={(e) => setResearchInterests(e.target.value)}
                placeholder="e.g. Computer Vision, Deep Learning, Edge AI"
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem',
                  backgroundColor: 'rgba(3, 7, 18, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.6rem',
                  color: '#F9FAFB',
                  fontSize: '0.82rem',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            {/* Technical Skills */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Technical Stack & Skills
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Python, PyTorch, C++, ROS"
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem',
                  backgroundColor: 'rgba(3, 7, 18, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.6rem',
                  color: '#F9FAFB',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Funding Checkbox */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              backgroundColor: 'rgba(3, 7, 18, 0.6)',
              padding: '0.65rem 0.85rem',
              borderRadius: '0.6rem',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <input
                type="checkbox"
                id="reqFunding"
                checked={requiresFunding}
                onChange={(e) => setRequiresFunding(e.target.checked)}
                style={{ accentColor: '#38BDF8', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="reqFunding" style={{ fontSize: '0.8rem', color: '#E2E8F0', cursor: 'pointer' }}>
                Require Verified Funding / RA / DAAD
              </label>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="btn-glow-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}
            >
              <Sparkles size={16} />
              {loading ? 'Evaluating Ranking...' : 'Run AI Match Engine'}
            </button>
          </form>
        </div>

        {/* Right: Matches Cards Feed */}
        <div>
          {/* Filter & Search Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#F9FAFB', letterSpacing: '-0.02em' }}>
                Ranked Faculty & Research Matches
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Weighted Scoring Formula: <code style={{ color: '#38BDF8' }}>S = 0.40R + 0.25K + 0.15P + 0.10F + 0.10I</code>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {/* Search Box */}
              <div style={{ position: 'relative' }}>
                <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Filter by name, topic..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{
                    padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: '#F9FAFB',
                    fontSize: '0.82rem',
                    outline: 'none',
                    width: '210px'
                  }}
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#F9FAFB',
                  fontSize: '0.82rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">All Statuses ({candidates.length})</option>
                <option value="ELIGIBLE">Eligible Only</option>
                <option value="REVIEW">Needs Review</option>
                <option value="INELIGIBLE">Ineligible</option>
              </select>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="glass-panel" style={{
              border: '1px solid rgba(244, 63, 94, 0.4)',
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FB7185', fontWeight: 700 }}>
                <AlertCircle size={18} />
                <span>Backend Connection Notice</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#FEE2E2' }}>{error}</p>
              <button
                onClick={() => runMatching()}
                className="btn-glass-secondary"
                style={{ width: 'fit-content', fontSize: '0.78rem', marginTop: '0.25rem' }}
              >
                Retry Request
              </button>
            </div>
          )}

          {/* Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredCandidates.map((match, idx) => (
              <div
                key={match.professorId}
                className="glass-panel-glow"
                style={{
                  padding: '1.5rem',
                  borderLeft: match.eligibility === 0 || match.eligibility === 'ELIGIBLE'
                    ? '4px solid #10B981'
                    : (match.eligibility === 1 || match.eligibility === 'NEEDS_REVIEW' ? '4px solid #F59E0B' : '4px solid #F43F5E')
                }}
              >
                {/* Header Row: Rank, Faculty Info, SVG Glowing Ring */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                    {/* Rank Badge */}
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#38BDF8',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      width: '36px',
                      height: '36px',
                      borderRadius: '0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      #{idx + 1}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F9FAFB', letterSpacing: '-0.02em' }}>
                          {match.professorName}
                        </h3>
                        {getEligibilityBadge(match.eligibility)}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                        <span>{match.professorTitle}</span>
                        <span>•</span>
                        <span style={{ color: '#E2E8F0', fontWeight: 500 }}>{match.universityName}</span>
                        <span>•</span>
                        <span style={{ color: '#38BDF8', fontWeight: 600 }}>{match.country}</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Glowing Score Dial */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.05em' }}>
                        MATCH SCORE
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                        Weighted S
                      </div>
                    </div>
                    <GlowingScoreRing score={match.scoreBreakdown.totalWeightedScore} size={64} strokeWidth={5.5} />
                  </div>
                </div>

                {/* Research Focus & Matched Keywords */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.88rem', color: '#F1F5F9', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#94A3B8', fontWeight: 500 }}>Research Focus: </span>
                    <strong style={{ color: '#F8FAFC' }}>{match.researchArea}</strong>
                  </div>

                  {/* Matched Keywords Tags */}
                  {match.matchedKeywords && match.matchedKeywords.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Tag size={12} />
                        Matched:
                      </span>
                      {match.matchedKeywords.map((tag, tIdx) => (
                        <span key={tIdx} className="badge-tag-cyan">
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Program Details Strip */}
                <div style={{
                  backgroundColor: 'rgba(3, 7, 18, 0.6)',
                  borderRadius: '0.65rem',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.15rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.85rem',
                  fontSize: '0.82rem',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <div>
                    <span style={{ color: '#94A3B8' }}>Program: </span>
                    <strong style={{ color: '#F9FAFB' }}>{match.programName} ({match.degree})</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94A3B8' }}>Cutoffs: </span>
                    <strong style={{ color: '#F9FAFB' }}>Min CGPA {match.minCgpa}</strong>
                    <span style={{ color: '#94A3B8', marginLeft: '0.5rem' }}>• IELTS {match.requiredIelts}</span>
                  </div>
                  <div>
                    <span style={{ color: '#94A3B8' }}>Funding: </span>
                    <strong style={{ color: '#34D399' }}>{match.fundingStatus}</strong>
                  </div>
                </div>

                {/* 5-Factor Score Breakdown Progress Bars */}
                <div style={{ marginBottom: '1.15rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                    MATHEMATICAL FIT BREAKDOWN (WEIGHTED CRITERIA)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.65rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94A3B8' }}>
                        <span>R (40%)</span>
                        <span style={{ color: '#38BDF8', fontWeight: 700 }}>{match.scoreBreakdown.researchAlignmentScore}%</span>
                      </div>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '9999px', height: '6px', overflow: 'hidden', marginTop: '0.25rem' }}>
                        <div style={{ width: `${match.scoreBreakdown.researchAlignmentScore}%`, height: '100%', background: 'linear-gradient(90deg, #0284C7, #38BDF8)', borderRadius: '9999px' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94A3B8' }}>
                        <span>K (25%)</span>
                        <span style={{ color: '#06B6D4', fontWeight: 700 }}>{match.scoreBreakdown.keywordOverlapScore}%</span>
                      </div>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '9999px', height: '6px', overflow: 'hidden', marginTop: '0.25rem' }}>
                        <div style={{ width: `${match.scoreBreakdown.keywordOverlapScore}%`, height: '100%', background: 'linear-gradient(90deg, #0891B2, #06B6D4)', borderRadius: '9999px' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94A3B8' }}>
                        <span>P (15%)</span>
                        <span style={{ color: '#10B981', fontWeight: 700 }}>{match.scoreBreakdown.academicProfileScore}%</span>
                      </div>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '9999px', height: '6px', overflow: 'hidden', marginTop: '0.25rem' }}>
                        <div style={{ width: `${match.scoreBreakdown.academicProfileScore}%`, height: '100%', background: 'linear-gradient(90deg, #059669, #10B981)', borderRadius: '9999px' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94A3B8' }}>
                        <span>F (10%)</span>
                        <span style={{ color: '#F59E0B', fontWeight: 700 }}>{match.scoreBreakdown.fundingAlignmentScore}%</span>
                      </div>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '9999px', height: '6px', overflow: 'hidden', marginTop: '0.25rem' }}>
                        <div style={{ width: `${match.scoreBreakdown.fundingAlignmentScore}%`, height: '100%', background: 'linear-gradient(90deg, #D97706, #F59E0B)', borderRadius: '9999px' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94A3B8' }}>
                        <span>I (10%)</span>
                        <span style={{ color: '#A855F7', fontWeight: 700 }}>{match.scoreBreakdown.institutionFitScore}%</span>
                      </div>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '9999px', height: '6px', overflow: 'hidden', marginTop: '0.25rem' }}>
                        <div style={{ width: `${match.scoreBreakdown.institutionFitScore}%`, height: '100%', background: 'linear-gradient(90deg, #7C3AED, #A855F7)', borderRadius: '9999px' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explanations List */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                    EXPLAINABLE MATCH AUDIT & ELIGIBILITY NOTES:
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {match.eligibilityNotes?.map((note, i) => (
                      <li key={i} style={{ color: note.includes('fails') || note.includes('below') ? '#FB7185' : '#34D399' }}>
                        {note}
                      </li>
                    ))}
                    {match.explanations?.map((exp, i) => (
                      <li key={`exp-${i}`}>{exp}</li>
                    ))}
                  </ul>
                </div>

                {/* Footer Action Bar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '0.85rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    {match.sourceUrl && (
                      <a
                        href={match.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#38BDF8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <ExternalLink size={12} />
                        Source Attribution
                      </a>
                    )}
                    <span>Verified: {new Date(match.checkedAtUtc).toLocaleDateString()}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    {match.labUrl && (
                      <a
                        href={match.labUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-glass-secondary"
                        style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
                      >
                        Lab Website
                      </a>
                    )}

                    <button
                      onClick={() => handleApproveLead(match)}
                      disabled={approvingProfId === match.professorId}
                      className="btn-glow-primary"
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem' }}
                    >
                      <CheckCircle size={15} />
                      {approvingProfId === match.professorId ? 'Approving...' : 'Approve Lead (Export v1)'}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredCandidates.length === 0 && (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem' }}>
                <Filter size={36} color="#64748B" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ color: '#E2E8F0', marginBottom: '0.5rem' }}>No Matches Found</h3>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                  Try resetting the search filter or selecting one of the Quick Profiles above.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approved Lead Export Modal */}
      {approvedLead && (
        <LeadApprovalModal
          lead={approvedLead}
          onClose={() => setApprovedLead(null)}
        />
      )}
    </div>
  );
}
