import React, { useState, useEffect } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useParams } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth.js'



const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>) },
    { id: 'behavioral', label: 'Behavioral Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { id: 'roadmap', label: 'Road Map', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>) },
]

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
    const [ open, setOpen ] = useState(false)
    const [ userAnswer, setUserAnswer ] = useState("")
    const [ grading, setGrading ] = useState(false)
    const [ gradeResult, setGradeResult ] = useState(null)
    const { handleGradeAnswer } = useInterview()

    const handleGrade = async (e) => {
        e.stopPropagation() // Prevent toggling the card open state
        if (!userAnswer.trim()) return
        setGrading(true)
        try {
            const result = await handleGradeAnswer(item.question, userAnswer, item.answer)
            if (result) {
                setGradeResult(result)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setGrading(false)
        }
    }

    return (
        <div className='q-card'>
            <div className='q-card__header' onClick={() => setOpen(o => !o)}>
                <span className='q-card__index'>Q{index + 1}</span>
                <p className='q-card__question'>{item.question}</p>
                <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </div>
            {open && (
                <div className='q-card__body'>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--intention'>Intention</span>
                        <p>{item.intention}</p>
                    </div>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--answer'>Model Answer</span>
                        <p>{item.answer}</p>
                    </div>

                    <div className='q-card__section q-card__practice'>
                        <span className='q-card__tag q-card__tag--practice'>Practice Your Answer</span>
                        <textarea
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            className='practice-textarea'
                            placeholder="Type your response to this question to test your knowledge. The AI will evaluate your score, point out strengths/weaknesses, and give suggestions..."
                        />
                        <div className='practice-actions'>
                            <button
                                onClick={handleGrade}
                                disabled={grading || !userAnswer.trim()}
                                className='practice-btn'
                            >
                                {grading ? 'Grading Response...' : 'Grade My Answer'}
                            </button>
                        </div>
                        {gradeResult && (
                            <div className='grade-result'>
                                <div className='grade-score-header'>
                                    <h4>AI Assessment</h4>
                                    <div className='score-badge'>
                                        Score: <span className={`score-value ${gradeResult.score >= 80 ? 'high' : gradeResult.score >= 60 ? 'mid' : 'low'}`}>{gradeResult.score}/100</span>
                                    </div>
                                </div>
                                <div className='grade-detail'>
                                    <h5>Feedback</h5>
                                    <p>{gradeResult.feedback}</p>
                                </div>
                                <div className='grade-detail'>
                                    <h5>Suggestions for Improvement</h5>
                                    <p>{gradeResult.suggestions}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

const RoadMapDay = ({ day, completedTasks, interviewId, onToggle }) => {
    return (
        <div className='roadmap-day'>
            <div className='roadmap-day__header'>
                <span className='roadmap-day__badge'>Day {day.day}</span>
                <h3 className='roadmap-day__focus'>{day.focus}</h3>
            </div>
            <ul className='roadmap-day__tasks'>
                {day.tasks.map((task, i) => {
                    const isCompleted = completedTasks.includes(task)
                    return (
                        <li 
                            key={i} 
                            className={`roadmap-task-item ${isCompleted ? 'completed' : ''}`}
                            onClick={() => onToggle(interviewId, task)}
                        >
                            <div className='checkbox-container'>
                                <input
                                    type='checkbox'
                                    checked={isCompleted}
                                    onChange={() => {}} // Checked status handled by parent li onClick
                                    className='task-checkbox'
                                />
                                <span className='checkbox-custom' />
                            </div>
                            <span className='task-text'>{task}</span>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

const FlashcardDeck = ({ questions }) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [flipped, setFlipped] = useState(false)

    if (!questions || questions.length === 0) return <p>No questions available.</p>

    const currentQuestion = questions[currentIndex]

    const handleNext = (e) => {
        e.stopPropagation()
        setFlipped(false)
        setTimeout(() => {
            setCurrentIndex(prev => (prev + 1) % questions.length)
        }, 150)
    }

    const handlePrev = (e) => {
        e.stopPropagation()
        setFlipped(false)
        setTimeout(() => {
            setCurrentIndex(prev => (prev - 1 + questions.length) % questions.length)
        }, 150)
    }

    return (
        <div className='flashcard-container'>
            <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
                <div className='flashcard-inner'>
                    {/* Front of card */}
                    <div className='flashcard-front'>
                        <span className='flashcard-tag'>Question {currentIndex + 1}</span>
                        <p className='flashcard-question'>{currentQuestion.question}</p>
                        <span className='flashcard-flip-hint'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                            Click card to reveal answer
                        </span>
                    </div>

                    {/* Back of card */}
                    <div className='flashcard-back'>
                        <div className='flashcard-back-content'>
                            <div className='flashcard-section'>
                                <span className='flashcard-section-tag intention'>Intention</span>
                                <p>{currentQuestion.intention}</p>
                            </div>
                            <div className='flashcard-section'>
                                <span className='flashcard-section-tag answer'>Model Answer</span>
                                <p>{currentQuestion.answer}</p>
                            </div>
                        </div>
                        <span className='flashcard-flip-hint'>Click card to flip back</span>
                    </div>
                </div>
            </div>

            {/* Deck Controls */}
            <div className='flashcard-controls'>
                <button className='deck-btn' onClick={handlePrev}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                    Prev
                </button>
                <span className='deck-progress'>{currentIndex + 1} of {questions.length}</span>
                <button className='deck-btn' onClick={handleNext}>
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
            </div>
        </div>
    )
}

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const navigate = useNavigate()
    const { handleLogout } = useAuth()
    const [ activeNav, setActiveNav ] = useState('technical')
    const [ viewMode, setViewMode ] = useState('list') // 'list' or 'flashcard'
    const { report, getReportById, loading, getResumePdf, handleToggleTask } = useInterview()
    const { interviewId } = useParams()

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [ interviewId ])

    // Reset viewMode back to list when changing sections
    useEffect(() => {
        setViewMode('list')
    }, [ activeNav ])

    if (loading || !report) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    const scoreColor =
        report.matchScore >= 80 ? 'score--high' :
            report.matchScore >= 60 ? 'score--mid' : 'score--low'

    const totalTasks = report.preparationPlan 
        ? report.preparationPlan.reduce((acc, day) => acc + day.tasks.length, 0)
        : 0
    const completedCount = report.completedTasks ? report.completedTasks.length : 0
    const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

    return (
        <div className='interview-page'>
            <div className='interview-layout'>

                {/* ── Left Nav ── */}
                <nav className='interview-nav'>
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className='interview-nav__back-btn'
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                            Back to Dashboard
                        </button>
                        <div className="nav-content">
                            <p className='interview-nav__label'>Sections</p>
                            {NAV_ITEMS.map(item => (
                                <button
                                    key={item.id}
                                    className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                    onClick={() => setActiveNav(item.id)}
                                >
                                    <span className='interview-nav__icon'>{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={() => { getResumePdf(interviewId) }}
                            className='button primary-button' >
                            <svg height={"0.8rem"} style={{ marginRight: "0.8rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 7.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"></path></svg>
                            Download Resume
                        </button>
                        <button
                            onClick={handleLogout}
                            className='interview-nav__logout-btn'
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            Logout
                        </button>
                    </div>
                </nav>

                <div className='interview-divider' />

                {/* ── Center Content ── */}
                <main className='interview-content'>
                    {activeNav === 'technical' && (
                        <section>
                            <div className='content-header'>
                                <div className='content-header__title-group'>
                                    <h2>Technical Questions</h2>
                                    <span className='content-header__count'>{report.technicalQuestions.length} questions</span>
                                </div>
                                <div className='view-toggle'>
                                    <button 
                                        className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                                        onClick={() => setViewMode('list')}
                                    >
                                        List View
                                    </button>
                                    <button 
                                        className={`toggle-btn ${viewMode === 'flashcard' ? 'active' : ''}`}
                                        onClick={() => setViewMode('flashcard')}
                                    >
                                        Flashcards
                                    </button>
                                </div>
                            </div>
                            
                            {viewMode === 'list' ? (
                                <div className='q-list'>
                                    {report.technicalQuestions.map((q, i) => (
                                        <QuestionCard key={i} item={q} index={i} />
                                    ))}
                                </div>
                            ) : (
                                <FlashcardDeck questions={report.technicalQuestions} />
                            )}
                        </section>
                    )}

                    {activeNav === 'behavioral' && (
                        <section>
                            <div className='content-header'>
                                <div className='content-header__title-group'>
                                    <h2>Behavioral Questions</h2>
                                    <span className='content-header__count'>{report.behavioralQuestions.length} questions</span>
                                </div>
                                <div className='view-toggle'>
                                    <button 
                                        className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                                        onClick={() => setViewMode('list')}
                                    >
                                        List View
                                    </button>
                                    <button 
                                        className={`toggle-btn ${viewMode === 'flashcard' ? 'active' : ''}`}
                                        onClick={() => setViewMode('flashcard')}
                                    >
                                        Flashcards
                                    </button>
                                </div>
                            </div>
                            
                            {viewMode === 'list' ? (
                                <div className='q-list'>
                                    {report.behavioralQuestions.map((q, i) => (
                                        <QuestionCard key={i} item={q} index={i} />
                                    ))}
                                </div>
                            ) : (
                                <FlashcardDeck questions={report.behavioralQuestions} />
                            )}
                        </section>
                    )}

                    {activeNav === 'roadmap' && (
                        <section>
                            <div className='content-header'>
                                <h2>Preparation Road Map</h2>
                                <span className='content-header__count'>{report.preparationPlan.length}-day plan</span>
                            </div>

                            <div className='progress-banner'>
                                <div className='progress-info'>
                                    <span className='progress-label'>Preparation Progress</span>
                                    <span className='progress-stats'>{progressPercent}% ({completedCount} of {totalTasks} tasks)</span>
                                </div>
                                <div className='progress-bar-bg'>
                                    <div className='progress-bar-fill' style={{ width: `${progressPercent}%` }} />
                                </div>
                            </div>

                            <div className='roadmap-list'>
                                {report.preparationPlan.map((day) => (
                                    <RoadMapDay 
                                        key={day.day} 
                                        day={day} 
                                        completedTasks={report.completedTasks || []}
                                        interviewId={interviewId}
                                        onToggle={handleToggleTask}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                <div className='interview-divider' />

                {/* ── Right Sidebar ── */}
                <aside className='interview-sidebar'>

                    {/* Match Score */}
                    <div className='match-score'>
                        <p className='match-score__label'>Match Score</p>
                        <div className={`match-score__ring ${scoreColor}`}>
                            <span className='match-score__value'>{report.matchScore}</span>
                            <span className='match-score__pct'>%</span>
                        </div>
                        <p className='match-score__sub'>Strong match for this role</p>
                    </div>

                    <div className='sidebar-divider' />

                    {/* Skill Gaps */}
                    <div className='skill-gaps'>
                        <p className='skill-gaps__label'>Skill Gaps</p>
                        <div className='skill-gaps__list'>
                            {report.skillGaps.map((gap, i) => (
                                <span key={i} className={`skill-tag skill-tag--${gap.severity}`}>
                                    {gap.skill}
                                </span>
                            ))}
                        </div>
                    </div>

                </aside>
            </div>
        </div>
    )
}

export default Interview