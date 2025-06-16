import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Placeholder for Firebase configuration and app ID (will be provided by the environment)
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Firebase Context to provide auth and db instances throughout the app
const FirebaseContext = createContext(null);

// Utility for Firebase initialization and authentication
const useFirebase = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initFirebase = async () => {
      try {
        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const firebaseAuth = getAuth(app);

        setDb(firestore);
        setAuth(firebaseAuth);

        // Sign in anonymously or with custom token
        if (initialAuthToken) {
          await signInWithCustomToken(firebaseAuth, initialAuthToken);
        } else {
          await signInAnonymously(firebaseAuth);
        }

        // Listen for auth state changes to get the user ID
        onAuthStateChanged(firebaseAuth, (user) => {
          if (user) {
            setUserId(user.uid);
          } else {
            // Fallback for anonymous or unauthenticated users if __initial_auth_token was not provided
            // and signInAnonymously failed or was not called.
            // This is primarily for ensuring userId is set for Firestore operations.
            setUserId(crypto.randomUUID()); // Generate a unique ID if no user is found
          }
          setLoading(false);
        });

      } catch (e) {
        console.error("Error initializing Firebase:", e);
        setError("Failed to initialize app. Please try again later.");
        setLoading(false);
      }
    };

    initFirebase();
  }, []); // Run only once on component mount

  return { db, auth, userId, loading, error };
};

// --- QUIZ DATA ---

// Holland Code Quiz Questions (RIASEC)
const hollandQuestions = [
  {
    id: 'h1',
    text: 'I enjoy building or repairing things with my hands.',
    type: 'R', // Realistic
  },
  {
    id: 'h2',
    text: 'I like to analyze data and solve complex problems.',
    type: 'I', // Investigative
  },
  {
    id: 'h3',
    text: 'I prefer activities that involve artistic expression, like writing or painting.',
    type: 'A', // Artistic
  },
  {
    id: 'h4',
    text: 'I enjoy helping, teaching, or counseling others.',
    type: 'S', // Social
  },
  {
    id: 'h5',
    text: 'I like to lead, persuade, or manage people.',
    type: 'E', // Enterprising
  },
  {
    id: 'h6',
    text: 'I am good at organizing information and paying attention to details.',
    type: 'C', // Conventional
  },
  {
    id: 'h7',
    text: 'I am interested in how machines work and enjoy hands-on tasks.',
    type: 'R',
  },
  {
    id: 'h8',
    text: 'I enjoy conducting research and exploring new theories.',
    type: 'I',
  },
  {
    id: 'h9',
    text: 'I like to express my originality and creativity.',
    type: 'A',
  },
  {
    id: 'h10',
    text: 'I feel a strong desire to serve the community and support others.',
    type: 'S',
  },
  {
    id: 'h11',
    text: 'I am comfortable taking risks and initiating projects.',
    type: 'E',
  },
  {
    id: 'h12',
    text: 'I value precision and enjoy working with numbers and records.',
    type: 'C',
  },
];

// Big Five Personality Traits Quiz Questions (OCEAN)
const bigFiveQuestions = [
  // Openness to Experience
  { id: 'b1', text: 'I have a vivid imagination.', trait: 'O', reverse: false },
  { id: 'b2', text: 'I am interested in abstract ideas.', trait: 'O', reverse: false },
  { id: 'b3', text: 'I avoid philosophical discussions.', trait: 'O', reverse: true }, // Reverse-coded
  // Conscientiousness
  { id: 'b4', text: 'I am always prepared.', trait: 'C', reverse: false },
  { id: 'b5', text: 'I pay attention to details.', trait: 'C', reverse: false },
  { id: 'b6', text: 'I often forget to put things back in their proper place.', trait: 'C', reverse: true }, // Reverse-coded
  // Extraversion
  { id: 'b7', text: 'I am the life of the party.', trait: 'E', reverse: false },
  { id: 'b8', text: 'I talk to a lot of different people at parties.', trait: 'E', reverse: false },
  { id: 'b9', text: 'I tend to be quiet around strangers.', trait: 'E', reverse: true }, // Reverse-coded
  // Agreeableness
  { id: 'b10', text: 'I feel others\' emotions.', trait: 'A', reverse: false },
  { id: 'b11', text: 'I make people feel at ease.', trait: 'A', reverse: false },
  { id: 'b12', text: 'I tend to find fault with others.', trait: 'A', reverse: true }, // Reverse-coded
  // Neuroticism
  { id: 'b13', text: 'I get stressed out easily.', trait: 'N', reverse: false },
  { id: 'b14', text: 'I worry about things.', trait: 'N', reverse: false },
  { id: 'b15', text: 'I am relaxed most of the time.', trait: 'N', reverse: true }, // Reverse-coded
];

// Simplified Job Profiles (Illustrative, not exhaustive O*Net data)
// Added 'industry' and 'keywords' for better matching with user preferences
const jobProfiles = [
  {
    title: 'Software Developer',
    description: 'Designs, develops, and maintains software applications.',
    holland: { R: 2, I: 5, A: 3, S: 1, E: 2, C: 4 }, // Investigative, Conventional, Artistic
    bigFive: { O: 4, C: 5, E: 2, A: 3, N: 2 }, // High Conscientiousness, moderate Openness
    industry: 'Technology',
    keywords: ['coding', 'programming', 'logic', 'problem-solving', 'design', 'development', 'analysis', 'algorithms']
  },
  {
    title: 'Graphic Designer',
    description: 'Creates visual concepts using computer software or by hand to communicate ideas that inspire, inform, or captivate consumers.',
    holland: { R: 1, I: 2, A: 5, S: 3, E: 2, C: 1 }, // Artistic, Social, Investigative
    bigFive: { O: 5, C: 3, E: 3, A: 4, N: 3 }, // High Openness, Agreeableness
    industry: 'Arts & Entertainment',
    keywords: ['design', 'creativity', 'visuals', 'art', 'drawing', 'illustration', 'software', 'communication']
  },
  {
    title: 'Registered Nurse',
    description: 'Provides and coordinates patient care, educates patients and the public about various health conditions, and provides advice and emotional support to patients and their family members.',
    holland: { R: 2, I: 3, A: 1, S: 5, E: 2, C: 4 }, // Social, Conventional, Investigative
    bigFive: { O: 3, C: 4, E: 3, A: 5, N: 3 }, // High Agreeableness, Conscientiousness
    industry: 'Healthcare',
    keywords: ['patient care', 'helping', 'counseling', 'medical', 'health', 'support', 'communication', 'problem-solving']
  },
  {
    title: 'Accountant',
    description: 'Prepares and examines financial records, ensures that financial records are accurate and that taxes are paid properly and on time.',
    holland: { R: 1, I: 3, A: 1, S: 2, E: 3, C: 5 }, // Conventional, Enterprising, Investigative
    bigFive: { O: 2, C: 5, E: 3, A: 3, N: 2 }, // High Conscientiousness
    industry: 'Finance',
    keywords: ['numbers', 'data', 'organizing', 'analysis', 'records', 'details', 'finance', 'tax']
  },
  {
    title: 'Marketing Manager',
    description: 'Plans, directs, or coordinates marketing policies and programs, such as determining the demand for products and services offered by a firm and its competitors.',
    holland: { R: 1, I: 2, A: 3, S: 4, E: 5, C: 2 }, // Enterprising, Social, Artistic
    bigFive: { O: 4, C: 4, E: 5, A: 4, N: 2 }, // High Extraversion, Openness, Conscientiousness, Agreeableness
    industry: 'Retail', // Could also be 'Marketing & Sales' or 'Technology' for digital marketing
    keywords: ['leading', 'persuading', 'strategy', 'communication', 'sales', 'marketing', 'creativity', 'management']
  },
  {
    title: 'Electrician',
    description: 'Installs, maintains, and repairs electrical wiring, equipment, and fixtures.',
    holland: { R: 5, I: 3, A: 1, S: 2, E: 2, C: 4 }, // Realistic, Conventional, Investigative
    bigFive: { O: 2, C: 5, E: 2, A: 3, N: 2 }, // High Conscientiousness
    industry: 'Construction',
    keywords: ['hands-on', 'repair', 'installation', 'technical', 'electrical', 'building', 'problem-solving', 'tools']
  },
  {
    title: 'Research Scientist',
    description: 'Conducts experiments and investigations to test hypotheses and develop new knowledge.',
    holland: { R: 3, I: 5, A: 2, S: 1, E: 2, C: 4 }, // Investigative, Conventional, Realistic
    bigFive: { O: 5, C: 4, E: 2, A: 3, N: 2 }, // High Openness, Conscientiousness
    industry: 'Education', // Often in academia or dedicated research institutions
    keywords: ['research', 'experiments', 'analysis', 'investigation', 'theories', 'problem-solving', 'data', 'writing']
  },
  {
    title: 'Teacher (High School)',
    description: 'Instructs students in a variety of academic subjects in public or private secondary schools.',
    holland: { R: 1, I: 3, A: 3, S: 5, E: 2, C: 2 }, // Social, Investigative, Artistic
    bigFive: { O: 4, C: 4, E: 4, A: 5, N: 3 }, // High Agreeableness, Extraversion, Conscientiousness, Openness
    industry: 'Education',
    keywords: ['teaching', 'educating', 'helping', 'communication', 'planning', 'mentoring', 'classroom', 'public speaking']
  },
  {
    title: 'Financial Analyst',
    description: 'Guides businesses and individuals in making investment decisions.',
    holland: { R: 1, I: 4, A: 1, S: 2, E: 4, C: 5 }, // Conventional, Enterprising, Investigative
    bigFive: { O: 3, C: 5, E: 4, A: 3, N: 2 }, // High Conscientiousness, Extraversion
    industry: 'Finance',
    keywords: ['finance', 'investment', 'analysis', 'numbers', 'data', 'advising', 'strategy', 'markets']
  },
  {
    title: 'Social Worker',
    description: 'Helps people cope with challenges in their lives, provides support and resources.',
    holland: { R: 1, I: 2, A: 3, S: 5, E: 2, C: 1 }, // Social, Artistic, Investigative
    bigFive: { O: 4, C: 3, E: 3, A: 5, N: 4 }, // High Agreeableness, Openness, Neuroticism (for empathy)
    industry: 'Healthcare', // Also 'Government' or 'Non-profit'
    keywords: ['helping', 'counseling', 'support', 'community', 'advocacy', 'communication', 'problem-solving', 'empathy']
  },
];

// List of top 10 industries for preferences
const topIndustries = [
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Manufacturing',
  'Retail',
  'Hospitality',
  'Construction',
  'Arts & Entertainment',
  'Government'
];


// --- COMPONENTS ---

// Custom Modal Component (replaces alert/confirm)
const Modal = ({ show, title, message, onClose, onConfirm, showConfirm = false }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full border border-gray-300">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition duration-200 ease-in-out font-medium"
          >
            Close
          </button>
          {showConfirm && (
            <button
              onClick={onConfirm}
              className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition duration-200 ease-in-out font-medium"
            >
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Start Screen Component with optional name input
const StartScreen = ({ onStart }) => {
  const [userName, setUserName] = useState('');

  const handleStartClick = () => {
    onStart(userName.trim()); // Pass trimmed name
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 p-4 text-center">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
          Discover Your Career Path
        </h1>
        <p className="text-lg text-gray-700 mb-8 max-w-prose mx-auto">
          Welcome to the Career Compass App! This tool will help you explore potential career paths by understanding your interests and personality traits. You'll complete two short quizzes to get started.
        </p>
        <div className="mb-6">
          <label htmlFor="userName" className="block text-gray-700 text-lg font-medium mb-2">
            Your Name (Optional):
          </label>
          <input
            type="text"
            id="userName"
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="e.g., Jane Doe"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <button
          onClick={handleStartClick}
          className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300"
        >
          Start Your Journey
        </button>
      </div>
    </div>
  );
};

// Quiz Component (reusable for Holland and Big Five)
const Quiz = ({ questions, quizType, onComplete }) => {
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  // Handle answer change for a question
  const handleAnswerChange = (questionId, value) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: parseInt(value, 10),
    }));
  };

  // Move to the next question
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Check if the current question has been answered before moving to the next
      if (answers.hasOwnProperty(questions[currentQuestionIndex].id)) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setModalContent({
          title: 'Answer Required',
          message: 'Please select an option for the current question before proceeding.'
        });
        setShowModal(true);
      }
    } else {
      // All questions answered, attempt to complete the quiz
      const allAnswered = questions.every(q => answers.hasOwnProperty(q.id));
      if (allAnswered) {
        onComplete(answers);
      } else {
        setModalContent({
          title: 'Quiz Incomplete',
          message: 'Please answer all questions before submitting.'
        });
        setShowModal(true);
      }
    }
  };

  // Move to the previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Render the current question
  const currentQuestion = questions[currentQuestionIndex];

  // Determine label for the scale
  const getScaleLabel = (score, quizType) => {
    if (quizType === 'holland') {
      switch (score) {
        case 1: return 'Strongly Dislike';
        case 2: return 'Slightly Dislike';
        case 3: return 'Neutral';
        case 4: return 'Slightly Like';
        case 5: return 'Strongly Like';
        default: return '';
      }
    } else { // bigFive
      switch (score) {
        case 1: return 'Very Inaccurate';
        case 2: return 'Somewhat Inaccurate';
        case 3: return 'Neutral';
        case 4: return 'Somewhat Accurate';
        case 5: return 'Very Accurate';
        default: return '';
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          {quizType === 'holland' ? 'Holland Code Quiz' : 'Big Five Personality Quiz'}
        </h2>
        <div className="mb-8">
          <p className="text-lg text-gray-700 mb-4">
            {currentQuestion.text}
          </p>
          <div className="flex flex-col space-y-3">
            {[1, 2, 3, 4, 5].map((score) => (
              <label key={score} className="inline-flex items-center p-3 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 transition duration-150 ease-in-out">
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={score}
                  checked={answers[currentQuestion.id] === score}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="form-radio h-5 w-5 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-3 text-gray-700">
                  {getScaleLabel(score, quizType)}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 rounded-full bg-gray-300 text-gray-800 font-medium hover:bg-gray-400 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-8 py-3 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            {currentQuestionIndex === questions.length - 1 ? 'Submit Quiz' : 'Next'}
          </button>
        </div>
      </div>
      <Modal
        show={showModal}
        title={modalContent.title}
        message={modalContent.message}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

// Preference Questions Component
const PreferenceQuestions = ({ onComplete, initialPreferences }) => {
  const [selectedIndustries, setSelectedIndustries] = useState(initialPreferences?.industries || []);
  const [otherIndustry, setOtherIndustry] = useState(initialPreferences?.otherIndustry || '');
  const [activities, setActivities] = useState(initialPreferences?.activities || ['', '', '']);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  const handleIndustryChange = (industry) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry]
    );
  };

  const handleActivityChange = (index, value) => {
    const newActivities = [...activities];
    newActivities[index] = value;
    setActivities(newActivities);
  };

  const handleSubmit = () => {
    // Validate that at least one industry is selected or other industry is filled
    if (selectedIndustries.length === 0 && otherIndustry.trim() === '') {
      setModalContent({
        title: 'Input Required',
        message: 'Please select at least one preferred industry or enter one manually.'
      });
      setShowModal(true);
      return;
    }
    // Validate that at least one activity field is filled if any are present
    if (activities.every(activity => activity.trim() === '')) {
      setModalContent({
        title: 'Input Required',
        message: 'Please enter at least one preferred activity.'
      });
      setShowModal(true);
      return;
    }

    const finalIndustries = [...selectedIndustries];
    if (otherIndustry.trim() !== '') {
      finalIndustries.push(otherIndustry.trim());
    }

    const finalActivities = activities.filter(activity => activity.trim() !== '');

    onComplete({
      industries: finalIndustries,
      activities: finalActivities,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-teal-600 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          Tell Us More About Your Preferences
        </h2>

        {/* Preferred Industries */}
        <div className="mb-8">
          <label className="block text-gray-700 text-lg font-medium mb-3">
            Top Preferred Industries (select all that apply):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {topIndustries.map((industry) => (
              <label key={industry} className="inline-flex items-center p-3 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 transition duration-150 ease-in-out">
                <input
                  type="checkbox"
                  value={industry}
                  checked={selectedIndustries.includes(industry)}
                  onChange={() => handleIndustryChange(industry)}
                  className="form-checkbox h-5 w-5 text-teal-600 focus:ring-teal-500 rounded"
                />
                <span className="ml-3 text-gray-700">{industry}</span>
              </label>
            ))}
          </div>
          <div className="mt-4">
            <label htmlFor="otherIndustry" className="block text-gray-700 text-md font-medium mb-2">
              Other Industry (Optional):
            </label>
            <input
              type="text"
              id="otherIndustry"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              placeholder="e.g., Renewable Energy"
              value={otherIndustry}
              onChange={(e) => setOtherIndustry(e.target.value)}
            />
          </div>
        </div>

        {/* Preferred Activities */}
        <div className="mb-8">
          <label className="block text-gray-700 text-lg font-medium mb-3">
            Top Preferred Activities (up to 3):
          </label>
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <input
                key={index}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                placeholder={`Activity ${index + 1}`}
                value={activity}
                onChange={(e) => handleActivityChange(index, e.target.value)}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={handleSubmit}
            className="px-8 py-3 rounded-full bg-teal-600 text-white font-bold hover:bg-teal-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            See My Recommendations
          </button>
        </div>
      </div>
      <Modal
        show={showModal}
        title={modalContent.title}
        message={modalContent.message}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};


// Results Display Component
const Results = ({ userName, hollandScores, bigFiveScores, preferences, recommendedJobs, onRetake, onGenerateAdvice, onEnhanceDescription }) => {
  const [expandedDescription, setExpandedDescription] = useState({});
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [enhancedDescLoading, setEnhancedDescLoading] = useState({});
  const [careerAdvice, setCareerAdvice] = useState('');

  // Load career advice and enhanced descriptions from preferences if available
  useEffect(() => {
    if (preferences?.careerAdvice) {
      setCareerAdvice(preferences.careerAdvice);
    }
    if (preferences?.enhancedJobDescriptions) {
      setExpandedDescription(preferences.enhancedJobDescriptions);
    }
  }, [preferences]);


  const formatHollandCode = (scores) => {
    const types = ['R', 'I', 'A', 'S', 'E', 'C'];
    const sorted = types.map(type => ({ type, score: scores[type] }))
      .sort((a, b) => b.score - a.score);
    return sorted.slice(0, 3).map(item => item.type).join('');
  };

  const hollandCode = formatHollandCode(hollandScores);

  const handleGenerateAdviceClick = async () => {
    setAdviceLoading(true);
    setCareerAdvice(''); // Clear previous advice
    // Pass all relevant data to the LLM
    const advice = await onGenerateAdvice(hollandScores, bigFiveScores, preferences.industries, preferences.activities);
    setCareerAdvice(advice);
    setAdviceLoading(false);
  };

  const handleEnhanceDescriptionClick = async (jobTitle, jobId) => {
    setEnhancedDescLoading(prev => ({ ...prev, [jobId]: true }));
    const enhanced = await onEnhanceDescription(jobTitle);
    setExpandedDescription(prev => ({ ...prev, [jobId]: enhanced }));
    setEnhancedDescLoading(prev => ({ ...prev, [jobId]: false }));
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-700 p-6 text-white flex flex-col items-center">
      <div className="bg-white text-gray-900 p-8 rounded-xl shadow-2xl max-w-4xl w-full mb-8">
        <h2 className="text-4xl font-extrabold text-center mb-6">Your Career Report {userName && `for ${userName}`}</h2>

        {/* Holland Code Results */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-6 border border-gray-200">
          <h3 className="text-2xl font-semibold mb-4 text-purple-700">Holland Code Results</h3>
          <p className="text-lg mb-4">
            Your primary Holland Code is: <span className="font-bold text-blue-600 text-2xl">{hollandCode}</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700">
            {Object.entries(hollandScores).map(([type, score]) => (
              <div key={type} className="flex items-center bg-white p-3 rounded-md shadow-sm border border-gray-100">
                <span className="font-semibold text-lg w-12">{type}:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-500 h-3 rounded-full"
                    style={{ width: `${(score / 5) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-3 text-sm">{score}</span>
              </div>
            ))}
          </div>
          <p className="text-sm italic mt-4 text-gray-600">
            <span className="font-semibold">R</span>ealistic (Doers), <span className="font-semibold">I</span>nvestigative (Thinkers), <span className="font-semibold">A</span>rtistic (Creators), <span className="font-semibold">S</span>ocial (Helpers), <span className="font-semibold">E</span>nterprising (Persuaders), <span className="font-semibold">C</span>onventional (Organizers).
          </p>
        </div>

        {/* Big Five Personality Results */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-6 border border-gray-200">
          <h3 className="text-2xl font-semibold mb-4 text-green-700">Big Five Personality Traits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            {Object.entries(bigFiveScores).map(([trait, score]) => (
              <div key={trait} className="flex items-center bg-white p-3 rounded-md shadow-sm border border-gray-100">
                <span className="font-semibold text-lg w-28">{trait}:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${(score / 5) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-3 text-sm">{score}</span>
              </div>
            ))}
          </div>
          <p className="text-sm italic mt-4 text-gray-600">
            <span className="font-semibold">O</span>penness, <span className="font-semibold">C</span>onscientiousness, <span className="font-semibold">E</span>xtraversion, <span className="font-semibold">A</span>greeableness, <span className="font-semibold">N</span>euroticism.
          </p>
        </div>

        {/* Preferred Industries */}
        {preferences?.industries && preferences.industries.length > 0 && (
          <div className="bg-yellow-50 p-6 rounded-lg shadow-inner mb-6 border border-yellow-200">
            <h3 className="text-2xl font-semibold mb-4 text-yellow-700">Your Preferred Industries</h3>
            <ul className="list-disc list-inside text-gray-800">
              {preferences.industries.map((industry, index) => (
                <li key={index}>{industry}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Preferred Activities */}
        {preferences?.activities && preferences.activities.length > 0 && (
          <div className="bg-yellow-50 p-6 rounded-lg shadow-inner mb-6 border border-yellow-200">
            <h3 className="text-2xl font-semibold mb-4 text-yellow-700">Your Preferred Activities</h3>
            <ul className="list-disc list-inside text-gray-800">
              {preferences.activities.map((activity, index) => (
                <li key={index}>{activity}</li>
              ))}
            </ul>
          </div>
        )}

        {/* LLM-powered Personalized Career Advice */}
        <div className="bg-orange-50 p-6 rounded-lg shadow-inner mb-6 border border-orange-200">
          <h3 className="text-2xl font-semibold mb-4 text-orange-700">Personalized Career Advice ✨</h3>
          <button
            onClick={handleGenerateAdviceClick}
            disabled={adviceLoading}
            className="px-6 py-2 rounded-full bg-orange-600 text-white font-bold shadow-md hover:bg-orange-700 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adviceLoading ? 'Generating...' : 'Get Personalized Advice'}
          </button>
          {careerAdvice && (
            <div className="mt-4 p-4 bg-orange-100 rounded-lg border border-orange-300 text-gray-800">
              <p className="whitespace-pre-wrap">{careerAdvice}</p>
            </div>
          )}
        </div>


        {/* Job Recommendations */}
        <div className="bg-blue-50 p-6 rounded-lg shadow-inner border border-blue-200">
          <h3 className="text-2xl font-semibold mb-4 text-blue-700">Top 5 Recommended Jobs</h3>
          {recommendedJobs.length > 0 ? (
            <ul className="space-y-4">
              {recommendedJobs.map((job, index) => (
                <li key={job.id} className="bg-white p-4 rounded-md shadow-sm border border-blue-100 flex flex-col items-start">
                  <div className="flex items-center justify-between w-full mb-2">
                    <h4 className="text-lg font-semibold text-gray-800 flex-1">
                      <span className="text-xl font-bold text-blue-800 mr-2">{index + 1}.</span> {job.title}
                    </h4>
                    <button
                      onClick={() => handleEnhanceDescriptionClick(job.title, job.id)}
                      disabled={enhancedDescLoading[job.id]}
                      className="ml-4 px-4 py-1 rounded-full bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {enhancedDescLoading[job.id] ? 'Enhancing...' : 'Enhance Description ✨'}
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    {expandedDescription[job.id] || job.description}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    <span className="font-medium">Holland Fit:</span> {job.hollandFit.toFixed(2)} |
                    <span className="font-medium"> Big Five Fit:</span> {job.bigFiveFit.toFixed(2)} |
                    <span className="font-medium"> Industry Fit:</span> {job.industryFit.toFixed(2)} |
                    <span className="font-medium"> Activity Fit:</span> {job.activityFit.toFixed(2)} |
                    <span className="font-medium"> Total Score:</span> {job.totalFit.toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700">No job recommendations found. Please re-take the quizzes.</p>
          )}
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={onRetake}
            className="px-8 py-3 rounded-full bg-purple-600 text-white font-bold shadow-lg hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300"
          >
            Retake Quizzes
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-300 mt-4">
        Your user ID: <span className="font-mono">{localStorage.getItem('user_id') || 'Loading...'}</span>
      </p>
    </div>
  );
};

// Main App Component
const App = () => {
  const { db, userId, loading, error } = useFirebase(); // Use the custom hook
  const [step, setStep] = useState('start'); // 'start', 'holland', 'bigFive', 'preferences', 'results'
  const [userName, setUserName] = useState('');
  const [hollandResults, setHollandResults] = useState(null);
  const [bigFiveResults, setBigFiveResults] = useState(null);
  const [preferences, setPreferences] = useState(null); // New state for preferences
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  // Store userId in localStorage once available to display it to the user
  useEffect(() => {
    if (userId) {
      localStorage.setItem('user_id', userId);
    }
  }, [userId]);

  // Load existing quiz results and preferences if available
  useEffect(() => {
    const loadAllResults = async () => {
      if (db && userId) {
        try {
          const userDocRef = doc(db, 'artifacts', appId, 'users', userId, 'user_career_profile', 'current');
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserName(data.name || '');
            setHollandResults(data.hollandScores || null);
            setBigFiveResults(data.bigFiveScores || null);
            setPreferences({
              industries: data.industries || [],
              activities: data.activities || [],
              careerAdvice: data.careerAdvice || '',
              enhancedJobDescriptions: data.enhancedJobDescriptions || {},
            });

            // Determine the step based on loaded data
            if (data.hollandScores && data.bigFiveScores && data.industries && data.activities) {
              setStep('results');
              // Ensure we pass loaded preferences to calculateRecommendations
              calculateRecommendations(data.hollandScores, data.bigFiveScores, {
                industries: data.industries || [],
                activities: data.activities || []
              });
            } else if (data.hollandScores && data.bigFiveScores) {
              setStep('preferences');
            } else if (data.hollandScores) {
              setStep('bigFive');
            } else {
              setStep('start');
            }
          } else {
            setStep('start'); // No existing data, start fresh
          }
        } catch (e) {
          console.error("Error loading previous results:", e);
          setModalContent({
            title: 'Error Loading Data',
            message: 'There was an issue loading your previous career profile.'
          });
          setShowModal(true);
          setStep('start'); // Fallback to start if loading fails
        }
      }
    };

    if (!loading && db && userId) {
      loadAllResults();
    }
  }, [loading, db, userId]); // Re-run when Firebase is ready or user ID changes


  // Function to save/update the entire user profile in Firestore
  const saveUserProfile = async (dataToSave) => {
    if (!db || !userId) {
      console.warn("Firestore not ready or userId missing, data not saved.");
      setModalContent({
        title: 'Save Warning',
        message: 'Your data could not be saved to the database. Please ensure you are logged in.'
      });
      setShowModal(true);
      return;
    }
    try {
      const userDocRef = doc(db, 'artifacts', appId, 'users', userId, 'user_career_profile', 'current');
      // Merge with existing data to ensure partial updates work
      await setDoc(userDocRef, { ...dataToSave, timestamp: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.error("Error saving user profile:", e);
      setModalContent({
        title: 'Save Error',
        message: 'There was an issue saving your career profile.'
      });
      setShowModal(true);
    }
  };


  // Handle start from StartScreen
  const handleStart = (name) => {
    setUserName(name);
    setStep('holland');
    saveUserProfile({ name }); // Save the user's name immediately
  };

  // Function to calculate Holland scores
  const calculateHollandScores = (answers) => {
    const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    hollandQuestions.forEach((q) => {
      scores[q.type] += answers[q.id] || 0;
    });
    return scores;
  };

  // Function to calculate Big Five scores
  const calculateBigFiveScores = (answers) => {
    const scores = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    bigFiveQuestions.forEach((q) => {
      // For reverse-coded questions, invert the score (6 - score)
      scores[q.trait] += q.reverse ? (6 - (answers[q.id] || 0)) : (answers[q.id] || 0);
    });
    return scores;
  };

  // Holland Quiz completion handler
  const handleHollandComplete = async (answers) => {
    const calculatedScores = calculateHollandScores(answers);
    setHollandResults(calculatedScores);
    await saveUserProfile({ hollandScores: calculatedScores });
    setStep('bigFive');
  };

  // Big Five Quiz completion handler
  const handleBigFiveComplete = async (answers) => {
    const calculatedScores = calculateBigFiveScores(answers);
    setBigFiveResults(calculatedScores);
    await saveUserProfile({ bigFiveScores: calculatedScores });
    setStep('preferences'); // Move to new preference questions
  };

  // Preferences completion handler
  const handlePreferencesComplete = async (userPreferences) => {
    setPreferences(userPreferences);
    await saveUserProfile({
      industries: userPreferences.industries,
      activities: userPreferences.activities
    });
    setStep('results');
    // Ensure Holland and Big Five results are available before calculating recommendations
    calculateRecommendations(hollandResults, bigFiveResults, userPreferences);
  };

  // Function to calculate job recommendations, now including preferences
  const calculateRecommendations = (userHolland, userBigFive, userPreferences) => {
    if (!userHolland || !userBigFive || !userPreferences) return;

    const scoresWithFit = jobProfiles.map((job, index) => {
      let hollandFit = 0;
      let bigFiveFit = 0;
      let industryFit = 0;
      let activityFit = 0;

      // Calculate Holland fit (Euclidean distance or simple match count)
      const hollandTypes = ['R', 'I', 'A', 'S', 'E', 'C'];
      hollandTypes.forEach(type => {
        hollandFit += Math.pow((userHolland[type] || 0) - (job.holland[type] || 0), 2);
      });
      hollandFit = 1 / (1 + Math.sqrt(hollandFit)); // Convert to similarity (higher is better)

      // Calculate Big Five fit (Euclidean distance or simple match count)
      const bigFiveTraits = ['O', 'C', 'E', 'A', 'N'];
      bigFiveTraits.forEach(trait => {
        bigFiveFit += Math.pow((userBigFive[trait] || 0) - (job.bigFive[trait] || 0), 2);
      });
      bigFiveFit = 1 / (1 + Math.sqrt(bigFiveFit)); // Convert to similarity (higher is better)

      // Calculate Industry Fit
      if (userPreferences.industries && userPreferences.industries.length > 0) {
        const matchingIndustry = userPreferences.industries.some(prefIndustry =>
          job.industry && job.industry.toLowerCase().includes(prefIndustry.toLowerCase())
        );
        if (matchingIndustry) {
          industryFit = 1; // Binary: 1 if matches, 0 if not
        }
      }

      // Calculate Activity Fit
      if (userPreferences.activities && userPreferences.activities.length > 0 && job.keywords && job.keywords.length > 0) {
        const userActivitiesLower = userPreferences.activities.map(act => act.toLowerCase());
        const jobKeywordsLower = job.keywords.map(kw => kw.toLowerCase());
        let matches = 0;
        userActivitiesLower.forEach(userAct => {
          // Check if any job keyword is contained in the user activity, or vice-versa
          const hasMatch = jobKeywordsLower.some(jobKw => userAct.includes(jobKw) || jobKw.includes(userAct));
          if (hasMatch) {
            matches++;
          }
        });
        activityFit = matches / userActivitiesLower.length; // Proportion of matching activities
      }

      // Combine all scores (example weighting, can be tuned)
      // Normalizing industryFit and activityFit to roughly the same scale as Holland/BigFive (0-1)
      const totalFit = (hollandFit * 0.3) + (bigFiveFit * 0.3) + (industryFit * 0.2) + (activityFit * 0.2);

      return { ...job, hollandFit, bigFiveFit, industryFit, activityFit, totalFit, id: index };
    });

    // Sort by total fit and get top 5
    const top5 = scoresWithFit.sort((a, b) => b.totalFit - a.totalFit).slice(0, 5);
    setRecommendedJobs(top5);
  };

  // LLM Call: Generate Personalized Career Advice
  const generateCareerAdvice = async (hollandScores, bigFiveScores, preferredIndustries, preferredActivities) => {
    const hollandString = Object.entries(hollandScores).map(([type, score]) => `${type}: ${score}`).join(', ');
    const bigFiveString = Object.entries(bigFiveScores).map(([trait, score]) => `${trait}: ${score}`).join(', ');
    const industriesString = preferredIndustries && preferredIndustries.length > 0 ? `Preferred Industries: ${preferredIndustries.join(', ')}.` : '';
    const activitiesString = preferredActivities && preferredActivities.length > 0 ? `Preferred Activities: ${preferredActivities.join(', ')}.` : '';

    const prompt = `Given the user's Holland Code scores (${hollandString}), Big Five personality scores (${bigFiveString}), ${industriesString} ${activitiesString} provide personalized career advice. Focus on strengths and general career directions, integrating insights from all provided information. Keep it concise and encouraging. Holland Code types are R (Realistic), I (Investigative), A (Artistic), S (Social), E (Enterprising), C (Conventional). Big Five traits are O (Openness), C (Conscientiousness), E (Extraversion), A (Agreeableness), N (Neuroticism).`;

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };
    const apiKey = ""; // Leave as empty string for Canvas to provide
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const advice = result.candidates[0].content.parts[0].text;
        // Save the generated advice to Firestore
        setPreferences(prev => ({ ...prev, careerAdvice: advice })); // Update local state
        await saveUserProfile({ careerAdvice: advice });
        return advice;
      } else {
        console.error("Gemini API returned unexpected structure or no content for career advice.");
        return "Could not generate personalized career advice at this time.";
      }
    } catch (e) {
      console.error("Error calling Gemini API for career advice:", e);
      setModalContent({
        title: 'API Error',
        message: 'Failed to get personalized career advice. Please try again later.'
      });
      setShowModal(true);
      return "Failed to get personalized career advice.";
    }
  };

  // LLM Call: Generate Enhanced Job Description
  const generateEnhancedDescription = async (jobTitle) => {
    const prompt = `Provide a more detailed and engaging job description for a "${jobTitle}". Include typical responsibilities, required skills, and potential work environments. Keep it professional and concise.`;

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };
    const apiKey = ""; // Leave as empty string for Canvas to provide
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const enhancedText = result.candidates[0].content.parts[0].text;
        // Save the enhanced description to Firestore
        const updatedEnhancedDescriptions = {
          ...(preferences?.enhancedJobDescriptions || {}),
          [jobTitle]: enhancedText // Store by jobTitle for simplicity
        };
        setPreferences(prev => ({ ...prev, enhancedJobDescriptions: updatedEnhancedDescriptions }));
        await saveUserProfile({ enhancedJobDescriptions: updatedEnhancedDescriptions });
        return enhancedText;
      } else {
        console.error("Gemini API returned unexpected structure or no content for job description.");
        return "Could not generate enhanced description.";
      }
    } catch (e) {
      console.error("Error calling Gemini API for job description:", e);
      setModalContent({
        title: 'API Error',
        message: 'Failed to enhance job description. Please try again later.'
      });
      setShowModal(true);
      return "Failed to enhance description.";
    }
  };


  // Handle retaking quizzes
  const handleRetakeQuizzes = () => {
    setUserName('');
    setHollandResults(null);
    setBigFiveResults(null);
    setPreferences(null);
    setRecommendedJobs([]);
    setStep('start'); // Go back to start to re-enter name
    // Optionally, clear data from Firestore for this user here if you want a complete reset
    // This would require a deleteDoc call. For now, it will just overwrite on new quiz submission.
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading app...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-700 text-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Render different components based on the current step
  return (
    <FirebaseContext.Provider value={{ db, userId }}>
      <div className="App font-inter antialiased">
        {step === 'start' && <StartScreen onStart={handleStart} />}
        {step === 'holland' && (
          <Quiz
            questions={hollandQuestions}
            quizType="holland"
            onComplete={handleHollandComplete}
          />
        )}
        {step === 'bigFive' && (
          <Quiz
            questions={bigFiveQuestions}
            quizType="bigFive"
            onComplete={handleBigFiveComplete}
          />
        )}
        {step === 'preferences' && (
          <PreferenceQuestions
            onComplete={handlePreferencesComplete}
            initialPreferences={preferences} // Pass initial data if loading from DB
          />
        )}
        {step === 'results' && hollandResults && bigFiveResults && preferences && (
          <Results
            userName={userName}
            hollandScores={hollandResults}
            bigFiveScores={bigFiveResults}
            preferences={preferences}
            recommendedJobs={recommendedJobs}
            onRetake={handleRetakeQuizzes}
            onGenerateAdvice={generateCareerAdvice} // Pass LLM function
            onEnhanceDescription={generateEnhancedDescription} // Pass LLM function
          />
        )}
        <Modal
          show={showModal}
          title={modalContent.title}
          message={modalContent.message}
          onClose={() => setShowModal(false)}
        />
      </div>
    </FirebaseContext.Provider>
  );
};

export default App;
