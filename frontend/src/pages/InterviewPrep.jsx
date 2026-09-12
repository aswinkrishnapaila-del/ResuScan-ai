import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Brain, Code, Users, Calculator, Puzzle,
  Loader2, ChevronRight, ChevronLeft, CheckCircle, XCircle,
  Clock, Trophy, Sparkles, BookOpen, ArrowRight, RefreshCw,
  AlertCircle, Lightbulb, Building2, Rocket, Target,
  ClipboardCheck, BarChart2,
} from 'lucide-react';
import { API_BASE } from '../config';

/* ── Category Config ──────────────────────────────────────────── */
const CATEGORIES = [
  { id: 'technical', label: 'Technical', icon: Code, color: '#6c63ff', bg: 'bg-primary-100 dark:bg-primary-900/30', desc: 'DSA, System Design, Coding & Tech concepts' },
  { id: 'non-technical', label: 'HR / Behavioral', icon: Users, color: '#22c55e', bg: 'bg-emerald-100 dark:bg-emerald-900/30', desc: 'Leadership, teamwork, conflict resolution' },
  { id: 'aptitude', label: 'Aptitude', icon: Calculator, color: '#f59e0b', bg: 'bg-amber-100 dark:bg-amber-900/30', desc: 'Math, percentages, time & work, probability' },
  { id: 'reasoning', label: 'Reasoning', icon: Puzzle, color: '#06b6d4', bg: 'bg-cyan-100 dark:bg-cyan-900/30', desc: 'Patterns, logic, syllogisms, verbal reasoning' },
];

const COMPANY_TYPES = [
  { id: 'product', label: 'Product-Based', icon: Rocket, desc: 'Google, Amazon, Microsoft, Flipkart' },
  { id: 'service', label: 'Service-Based', icon: Building2, desc: 'TCS, Infosys, Wipro, Cognizant' },
  { id: 'startup', label: 'Startup', icon: Sparkles, desc: 'Early-stage, Series A-C Companies' },
  { id: 'mnc', label: 'MNC', icon: Target, desc: 'IBM, Oracle, SAP, Siemens' },
  { id: 'government', label: 'Govt / PSU', icon: GraduationCap, desc: 'ISRO, DRDO, BSNL, Railways' },
  { id: 'consulting', label: 'Consulting', icon: BarChart2, desc: 'Deloitte, McKinsey, Accenture' },
];

/* ── Difficulty Badge ─────────────────────────────────────────── */
function DifficultyBadge({ level }) {
  const styles = {
    easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    hard: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  };
  return (
    <span className={`badge text-[10px] font-bold ${styles[level] || styles.medium}`}>
      {level?.toUpperCase() || 'MEDIUM'}
    </span>
  );
}

/* ── Question & Option Jumbling Helpers ────────────────────────── */
function shuffleArray(arr) {
  if (!Array.isArray(arr)) return arr;
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function jumbleTestData(data) {
  if (!data || !Array.isArray(data.questions)) return data;
  const questionsCopy = data.questions.map(q => {
    const opts = Array.isArray(q.options) ? [...q.options] : [];
    const correctIdx = q.correct ?? 0;
    const correctVal = opts[correctIdx] || '';

    const cleanOpts = opts.map(o => String(o).replace(/^[A-D]\)\s*/, ''));
    const cleanCorrectVal = String(correctVal).replace(/^[A-D]\)\s*/, '');

    const shuffledClean = shuffleArray(cleanOpts);
    const labels = ['A) ', 'B) ', 'C) ', 'D) '];
    const formattedOpts = shuffledClean.map((o, idx) => `${labels[idx] || ''}${o}`);
    const newCorrectIdx = shuffledClean.indexOf(cleanCorrectVal);

    return {
      ...q,
      options: formattedOpts,
      correct: newCorrectIdx >= 0 ? newCorrectIdx : 0
    };
  });

  return {
    ...data,
    questions: shuffleArray(questionsCopy)
  };
}

/* ── Questions View ───────────────────────────────────────────── */
function QuestionsView({ questions, category, onBack, onStartTest, isLoadingTest }) {
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const catConfig = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = (q.question || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (q.answer || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = difficultyFilter === 'all' || (q.difficulty || 'medium').toLowerCase() === difficultyFilter.toLowerCase();
    return matchesSearch && matchesDiff;
  });

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn btn-ghost p-2">
            <ChevronLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <catConfig.icon size={20} style={{ color: catConfig.color }} />
              {catConfig.label} Practice & Prep Hub
            </h2>
            <p className="text-xs text-slate-400">Study model answers and key concepts before attempting the timed test</p>
          </div>
        </div>
        <button className="btn btn-primary text-xs px-4 py-2" onClick={onStartTest} disabled={isLoadingTest}>
          {isLoadingTest
            ? <><Loader2 size={14} className="spin" /> Generating Test...</>
            : <><ClipboardCheck size={14} /> Start Timed Mock Test (15 MCQs)</>
          }
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card dark:bg-surface-800 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full sm:w-72 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-surface-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-xs text-slate-400 font-medium mr-1">Difficulty:</span>
            {['all', 'easy', 'medium', 'hard'].map(level => (
              <button
                key={level}
                onClick={() => setDifficultyFilter(level)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg capitalize transition-all ${
                  difficultyFilter === level
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q, i) => (
            <div
              key={q.id || i}
              className="card dark:bg-surface-800 cursor-pointer hover:shadow-md transition-all"
              onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                     style={{ background: catConfig.color }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{q.question}</p>
                    <DifficultyBadge level={q.difficulty} />
                  </div>

                  <AnimatePresence>
                    {expandedId === q.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 space-y-3">
                          <div className="rounded-xl bg-slate-50 dark:bg-surface-950 border border-slate-200 dark:border-slate-700 p-4">
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1.5">💡 Model Answer</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{q.answer}</p>
                          </div>
                          {q.tip && (
                            <div className="flex gap-2 items-start rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 p-3">
                              <Lightbulb size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-amber-700 dark:text-amber-400">{q.tip}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className="text-[10px] text-slate-400 mt-1.5">
                    {expandedId === q.id ? 'Click to collapse' : 'Click to see model answer'}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">No practice questions found matching your filter criteria.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Mock Test View ───────────────────────────────────────────── */
function MockTestView({ testData, onBack, onRetake }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes = 900 seconds
  const timerRef = useRef(null);

  const questions = testData?.questions || [];
  const total = questions.length;
  const q = questions[currentQ];

  // Single 15-minute timer for the entire test
  useEffect(() => {
    if (showResults) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setShowResults(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [showResults]);

  const selectAnswer = (optIdx) => {
    setAnswers(prev => ({ ...prev, [currentQ]: optIdx }));
  };

  const nextQuestion = () => {
    if (currentQ < total - 1) {
      setCurrentQ(c => c + 1);
    } else {
      clearInterval(timerRef.current);
      setShowResults(true);
    }
  };

  const prevQuestion = () => {
    if (currentQ > 0) {
      setCurrentQ(c => c - 1);
    }
  };

  // Results
  if (showResults) {
    clearInterval(timerRef.current);
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    const pct = Math.round((correct / total) * 100);
    const passed = pct >= 60;

    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
        {/* Score Card */}
        <div className={`card dark:bg-surface-800 text-center p-8 border-2 ${passed ? 'border-emerald-300 dark:border-emerald-700' : 'border-red-300 dark:border-red-700'}`}>
          <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full mb-4 ${passed ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            {passed ? <Trophy size={36} className="text-emerald-500" /> : <AlertCircle size={36} className="text-red-500" />}
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
            {correct}/{total} Correct
          </h2>
          <p className={`text-4xl font-black mb-2 ${passed ? 'text-emerald-500' : 'text-red-500'}`}>{pct}%</p>
          <p className={`text-sm font-semibold ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {pct >= 90 ? '🏆 Outstanding! You\'re interview-ready!' :
             pct >= 70 ? '✅ Great job! Keep practicing the weak areas.' :
             pct >= 60 ? '👍 You passed! Review the explanations below.' :
             pct >= 40 ? '📚 Need more practice. Review all answers carefully.' :
             '⚠️ Significant preparation needed. Study the topics and retry.'}
          </p>
        </div>

        {/* Review Questions */}
        <div className="space-y-3">
          <p className="section-label">Review All Answers</p>
          {questions.map((q, i) => {
            const userAns = answers[i];
            const isCorrect = userAns === q.correct;
            const answered = userAns !== undefined;

            return (
              <div key={i} className={`card dark:bg-surface-800 border-l-4 ${isCorrect ? 'border-l-emerald-500' : answered ? 'border-l-red-500' : 'border-l-slate-300'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${isCorrect ? 'bg-emerald-500' : answered ? 'bg-red-500' : 'bg-slate-400'}`}>
                    {i + 1}
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{q.question}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 ml-10">
                  {q.options.map((opt, j) => (
                    <div
                      key={j}
                      className={`rounded-xl border p-3 text-xs font-medium ${
                        j === q.correct
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                          : j === userAns && j !== q.correct
                          ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {j === q.correct && <CheckCircle size={12} className="text-emerald-500" />}
                        {j === userAns && j !== q.correct && <XCircle size={12} className="text-red-500" />}
                        {opt}
                      </span>
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <div className="ml-10 rounded-xl bg-slate-50 dark:bg-surface-950 border border-slate-200 dark:border-slate-700 p-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <strong className="text-slate-800 dark:text-slate-200">Explanation:</strong> {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="btn btn-primary flex-1 py-2.5" onClick={onRetake}>
            <RefreshCw size={16} /> Retake Test
          </button>
          <button className="btn btn-outline flex-1 py-2.5" onClick={onBack}>
            <ChevronLeft size={16} /> Back to Questions
          </button>
        </div>
      </motion.div>
    );
  }

  if (!q) return null;

  const progress = ((currentQ + 1) / total) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerColor = timeLeft <= 60 ? 'text-red-500' : timeLeft <= 180 ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400';

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Question {currentQ + 1} of {total}
          </span>
          <span className={`flex items-center gap-1 font-bold ${timerColor}`}>
            <Clock size={13} /> {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question Card */}
      <div className="card dark:bg-surface-800 p-6 space-y-5">
        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
          {q.question}
        </h3>

        <div className="space-y-3">
          {q.options.map((opt, j) => (
            <button
              key={j}
              onClick={() => selectAnswer(j)}
              className={`w-full text-left rounded-xl border-2 p-4 text-sm font-medium transition-all ${
                answers[currentQ] === j
                  ? 'border-primary bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-500'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-slate-50 dark:hover:bg-surface-900'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            className="btn btn-ghost text-xs"
            onClick={prevQuestion}
            disabled={currentQ === 0}
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <button
            className="btn btn-primary text-xs px-6 py-2.5"
            onClick={nextQuestion}
          >
            {currentQ === total - 1 ? 'Finish Test' : 'Next'} <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Question dots */}
      <div className="flex justify-center gap-1.5 flex-wrap">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            className={`h-3 w-3 rounded-full transition-all ${
              i === currentQ
                ? 'bg-primary scale-125'
                : answers[i] !== undefined
                ? 'bg-emerald-400'
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ── Main InterviewPrep Page ──────────────────────────────────── */
export default function InterviewPrep() {
  const [step, setStep] = useState('select');       // select → questions → test
  const [category, setCategory] = useState(null);
  const [companyType, setCompanyType] = useState('product');
  const [questions, setQuestions] = useState([]);
  const [testData, setTestData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTest, setIsLoadingTest] = useState(false);
  const [error, setError] = useState(null);
  const [skills, setSkills] = useState([]);

  // Load scanned skills from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('scanned_resume_skills');
    if (stored) {
      try { setSkills(JSON.parse(stored)); } catch {}
    }
  }, []);

  const fetchQuestions = async (cat) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/interview-questions`, {
        skills,
        role: localStorage.getItem('scanned_resume_title')?.replace(/\.[^/.]+$/, '') || 'Software Engineer',
        category: cat,
        company_type: companyType,
      }, { timeout: 60000 });
      setQuestions(res.data.questions || []);
      setCategory(cat);
      setStep('questions');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate questions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMockTest = async () => {
    setIsLoadingTest(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/mock-test`, {
        skills,
        role: localStorage.getItem('scanned_resume_title')?.replace(/\.[^/.]+$/, '') || 'Software Engineer',
        category,
        company_type: companyType,
      }, { timeout: 60000 });
      setTestData(jumbleTestData(res.data));
      setStep('test');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate mock test');
    } finally {
      setIsLoadingTest(false);
    }
  };

  const handleRetake = () => {
    setTestData(null);
    fetchMockTest();
  };

  /* ── Category Selection ── */
  if (step === 'select') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Hero */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 dark:border-violet-800/50 bg-violet-50 dark:bg-violet-900/20 px-4 py-1.5 mb-2">
            <GraduationCap size={14} className="text-violet-500" />
            <span className="text-xs font-bold text-violet-600 dark:text-violet-400">AI Interview Preparation</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            Prepare for Your <span className="text-violet-500">Dream Interview</span>
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            Practice with AI-generated questions tailored to your skills. Take mock tests and track your readiness.
          </p>
        </div>

        {/* Company Type */}
        <div className="max-w-xl mx-auto">
          <p className="section-label mb-3 text-center">What type of company are you targeting?</p>
          <div className="grid grid-cols-2 gap-3">
            {COMPANY_TYPES.map(ct => (
              <button
                key={ct.id}
                onClick={() => setCompanyType(ct.id)}
                className={`card dark:bg-surface-800 text-center p-5 transition-all cursor-pointer ${
                  companyType === ct.id
                    ? 'border-violet-400 dark:border-violet-600 shadow-md ring-2 ring-violet-200 dark:ring-violet-800'
                    : 'hover:border-violet-300 dark:hover:border-violet-700'
                }`}
              >
                <ct.icon size={28} className={`mx-auto mb-2 ${companyType === ct.id ? 'text-violet-500' : 'text-slate-400'}`} />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{ct.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{ct.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="max-w-2xl mx-auto">
          <p className="section-label mb-3 text-center">Choose a preparation category</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => fetchQuestions(cat.id)}
                disabled={isLoading}
                className="card dark:bg-surface-800 text-left p-5 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${cat.bg}`}>
                    <cat.icon size={24} style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-0.5">{cat.label}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{cat.desc}</p>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-primary flex-shrink-0 mt-1 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="text-center py-4">
            <Loader2 size={28} className="spin mx-auto text-violet-500 mb-2" />
            <p className="text-sm text-slate-400">AI is generating interview questions…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-xl mx-auto flex gap-2.5 rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/10 p-4 text-sm text-red-600 dark:text-red-400 items-start">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Skills from scanned resume */}
        {skills.length > 0 && (
          <div className="max-w-xl mx-auto rounded-xl border border-violet-200 dark:border-violet-800/30 bg-violet-50 dark:bg-violet-900/10 p-4">
            <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mb-2">
              🎯 Questions will be personalized based on your scanned resume skills:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 12).map(s => (
                <span key={s} className="inline-flex items-center rounded-full border border-violet-200 dark:border-violet-800 bg-white dark:bg-surface-800 px-2.5 py-0.5 text-[11px] font-medium text-violet-600 dark:text-violet-400">
                  {s}
                </span>
              ))}
              {skills.length > 12 && <span className="text-[11px] text-violet-400">+{skills.length - 12} more</span>}
            </div>
          </div>
        )}

        {/* Feature highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
          {[
            { icon: Brain, color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30', label: 'AI-Generated', desc: 'Questions tailored to you' },
            { icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Model Answers', desc: 'Detailed explanations' },
            { icon: ClipboardCheck, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Mock Tests', desc: '10-question MCQ quizzes' },
            { icon: Target, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Score & Review', desc: 'Detailed result analysis' },
          ].map(({ icon: Icon, color, bg, label, desc }) => (
            <div key={label} className="card dark:bg-surface-800 text-center p-4 space-y-2">
              <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={20} className={color} />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{label}</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  /* ── Questions View ── */
  if (step === 'questions') {
    return (
      <QuestionsView
        questions={questions}
        category={category}
        onBack={() => { setStep('select'); setQuestions([]); setError(null); }}
        onStartTest={fetchMockTest}
        isLoadingTest={isLoadingTest}
      />
    );
  }

  /* ── Mock Test View ── */
  if (step === 'test' && testData) {
    return (
      <MockTestView
        testData={testData}
        onBack={() => { setStep('questions'); setTestData(null); }}
        onRetake={handleRetake}
      />
    );
  }

  return null;
}
