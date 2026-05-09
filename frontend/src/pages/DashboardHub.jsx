import React from 'react';
import { useUser } from '../context/UserContext';
import { FileText, FileSearch, Briefcase, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardHub({ setActiveTab }) {
  const { profile } = useUser();
  
  const userName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Alex';

  const features = [
    {
      id: 'resumes',
      title: 'Resume Scanner',
      desc: 'Analyze and optimize your resume against job descriptions using NLP.',
      icon: <FileSearch size={32} color="#fff" />,
      color: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      badge: 'Most Popular'
    },
    {
      id: 'builder',
      title: 'AI Resume Builder',
      desc: 'Create beautiful, ATS-friendly resumes with AI tone adjustments.',
      icon: <FileText size={32} color="#fff" />,
      color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    },
    {
      id: 'matching',
      title: 'Job Matching',
      desc: 'Find the best roles that match your newly generated resume.',
      icon: <Briefcase size={32} color="#fff" />,
      color: 'linear-gradient(135deg, #10b981, #059669)',
      badge: 'New'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="dashboard-hub"
    >
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          Welcome back, <span style={{ color: 'var(--primary)' }}>{userName}</span>
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
          Optimize your career profile and land your dream job faster.
        </p>
      </div>

      <div className="grid-2" style={{ gap: '2rem' }}>
        {features.map((feat) => (
          <div 
            key={feat.id}
            className="card interactive-card"
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              minHeight: '200px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onClick={() => setActiveTab(feat.id)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {feat.badge && (
              <span className="badge" style={{ 
                position: 'absolute', 
                top: '1rem', 
                right: '1rem', 
                backgroundColor: feat.badge === 'New' ? '#10b981' : '#3b82f6',
                color: 'white',
                border: 'none'
              }}>
                {feat.badge}
              </span>
            )}
            
            <div>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '16px', 
                background: feat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {feat.icon}
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{feat.title}</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{feat.desc}</p>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: 'var(--primary)', 
              fontWeight: 600,
              marginTop: '1.5rem'
            }}>
              Explore Tool <ArrowRight size={18} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
