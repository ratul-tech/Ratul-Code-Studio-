import * as React from 'react';
import { useState, useEffect, ReactNode, Component, ErrorInfo } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { db, auth } from './firebase';
import { Project } from './types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  LogOut, 
  LogIn, 
  X,
  Code2,
  LayoutGrid,
  Settings,
  AlertCircle,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  Sparkles,
  Zap,
  Mail,
  ArrowRight,
  Check,
  MessageCircle,
  Facebook,
  Instagram
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { AnimatedProfilePhoto } from './components/AnimatedProfilePhoto';
import { ContactSection } from './components/ContactSection';

// --- Error Handling Utilities ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Error Boundary ---

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public props: ErrorBoundaryProps;
  public state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      let isPermissionError = false;
      let isAuthConfigError = false;

      try {
        const errorMsg = this.state.error?.message || "";
        const parsed = JSON.parse(errorMsg);
        if (parsed.error?.includes('permission-denied')) {
          isPermissionError = true;
          errorMessage = "Firestore Permission Denied. Please ensure you have applied the security rules in your Firebase Console.";
        } else if (parsed.error) {
          errorMessage = parsed.error;
        }
      } catch {
        const msg = this.state.error?.message || "";
        if (msg.includes('auth/configuration-not-found')) {
          isAuthConfigError = true;
          errorMessage = "Firebase Auth Configuration Not Found. Please enable the Email/Password provider in your Firebase Console.";
        } else if (msg.includes('permission-denied')) {
          isPermissionError = true;
          errorMessage = "Firestore Permission Denied. Please ensure you have applied the security rules in your Firebase Console.";
        } else {
          errorMessage = msg || errorMessage;
        }
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-6">
          <div className="max-w-md w-full glass rounded-3xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-red-500 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-4">Application Error</h2>
            <p className="text-neutral-400 mb-8 leading-relaxed">
              {errorMessage}
            </p>
            
            {isPermissionError && (
              <div className="text-left bg-white/5 rounded-xl p-4 mb-8 text-sm space-y-2">
                <p className="font-bold text-emerald-500">How to fix:</p>
                <ol className="list-decimal list-inside text-neutral-300 space-y-1">
                  <li>Go to Firebase Console</li>
                  <li>Firestore Database &gt; Rules</li>
                  <li>Set <code className="bg-black/30 px-1 rounded">allow read: if true;</code> for projects</li>
                  <li>Click Publish</li>
                </ol>
              </div>
            )}

            {isAuthConfigError && (
              <div className="text-left bg-white/5 rounded-xl p-4 mb-8 text-sm space-y-2">
                <p className="font-bold text-emerald-500">How to fix:</p>
                <ol className="list-decimal list-inside text-neutral-300 space-y-1">
                  <li>Go to Firebase Console</li>
                  <li>Authentication &gt; Sign-in method</li>
                  <li>Click "Add new provider"</li>
                  <li>Select "Email/Password" and enable it</li>
                </ol>
              </div>
            )}

            <button 
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3 rounded-xl hover:bg-neutral-200 transition-colors"
            >
              <RefreshCcw size={18} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Project Description Component ---

function ProjectDescription({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const limit = 150;
  const shouldTruncate = text.length > limit;

  return (
    <div className="mb-4">
      <motion.div
        animate={{ height: isExpanded ? 'auto' : '4.5rem' }}
        className="overflow-hidden relative"
      >
        <p className={cn(
          "text-neutral-400 text-sm leading-relaxed",
          !isExpanded && shouldTruncate && "line-clamp-3"
        )}>
          {text}
        </p>
        {!isExpanded && shouldTruncate && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-neutral-900/50 to-transparent pointer-events-none" />
        )}
      </motion.div>
      
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-xs font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
        >
          {isExpanded ? (
            <>
              See Less <ChevronUp size={14} />
            </>
          ) : (
            <>
              See More <ChevronDown size={14} />
            </>
          )}
        </button>
      )}
    </div>
  );
}

// --- Default Portfolio Projects ---

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'prototype-1',
    title: 'VibeFlow · AI Applet Studio',
    description: 'An intelligent rapid web app prototyping canvas built to turn natural language prompts into live interactive components. Leverages LLM reasoning, instantaneous hot previews, and modular state management to compress prototyping cycles from days to minutes.',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    techStack: 'React, TypeScript, Tailwind CSS, Gemini API',
    demoUrl: 'https://github.com',
    createdAt: null
  },
  {
    id: 'prototype-2',
    title: 'Cognitive Canvas · Workflow Engine',
    description: 'A visual prototyping suite for experimenting with multi-agent coordination, structured prompts, and automated web app pipelines. Built to explore the boundary between human creative direction and automated code synthesis.',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    techStack: 'Vite, React, Motion, Firebase',
    demoUrl: 'https://github.com',
    createdAt: null
  },
  {
    id: 'prototype-3',
    title: 'PromptCraft · Rapid Prototyper',
    description: 'A developer utility for crafting, testing, and benchmarking production prompts for LLM-driven applications. Features interactive parameter tweaking, token inspection, and swift prototyping feedback to streamline vibe-coding iterations.',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    techStack: 'Next.js, Tailwind CSS, WebSockets, TypeScript',
    demoUrl: 'https://github.com',
    createdAt: null
  }
];

// --- Main Application ---

function PortfolioApp() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    techStack: '',
    demoUrl: ''
  });

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [secretClickCount, setSecretClickCount] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const ADMIN_EMAIL = "shahriarislam275@gmail.com";
  const DEFAULT_ADMIN_PASSWORD = "shahriarislam275@gmail.com";
  const WHATSAPP_RAW = "8801743904049";
  const WHATSAPP_NUMBER = "+8801743904049";
  const WHATSAPP_DEFAULT_MSG = "Hi Shahriar! I saw your portfolio and would like to discuss a project with you.";
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_RAW}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MSG)}`;
  const FACEBOOK_URL = "https://www.facebook.com/shahriar.islam.ratul.00";
  const INSTAGRAM_URL = "https://www.instagram.com/shahriar_islam_ratul/";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    if (secretClickCount >= 5) {
      setIsLoginModalOpen(true);
      setSecretClickCount(0);
    }
  }, [secretClickCount]);

  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setIsOffline(false);
      } catch (error: any) {
        if (error.message?.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
          setIsOffline(true);
        }
      }
    }
    testConnection();

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser?.email === ADMIN_EMAIL);
      setLoading(false);
    });

    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribeProjects = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(projectsData);
      setError(null);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'projects');
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProjects();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (loginData.password !== DEFAULT_ADMIN_PASSWORD) {
      setError("Incorrect admin password.");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      setIsLoginModalOpen(false);
      setLoginData({ email: '', password: '' });
      setError(null);
    } catch (err: any) {
      console.error("Login failed", err);
      if (err.code === 'auth/user-not-found') {
        // Try to create the admin user if it doesn't exist (one-time bootstrap)
        if (loginData.email === ADMIN_EMAIL && loginData.password === DEFAULT_ADMIN_PASSWORD) {
          try {
            await createUserWithEmailAndPassword(auth, loginData.email, loginData.password);
            setIsLoginModalOpen(false);
            setLoginData({ email: '', password: '' });
            setError(null);
            return;
          } catch (createErr: any) {
            setError(createErr.message);
          }
        } else {
          setError("Invalid email or password.");
        }
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Invalid email or password.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const path = 'projects';
    try {
      if (editingProject) {
        await updateDoc(doc(db, path, editingProject.id!), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, path), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      closeModal();
    } catch (err) {
      handleFirestoreError(err, editingProject ? OperationType.UPDATE : OperationType.CREATE, path);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin || !window.confirm("Are you sure you want to delete this project?")) return;
    const path = `projects/${id}`;
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const openModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description,
        imageUrl: project.imageUrl,
        techStack: project.techStack,
        demoUrl: project.demoUrl
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        techStack: '',
        demoUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const displayProjects = projects.length > 0 ? projects : DEFAULT_PROJECTS;

  const copyEmail = () => {
    navigator.clipboard?.writeText(ADMIN_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const scrollToProjects = () => {
    const el = document.getElementById('projects');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen font-sans">
      {/* Header */}
      <nav className="sticky top-0 z-40 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Code2 className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-display font-bold tracking-tight">
                Shahriar Islam <span className="text-emerald-500">Ratul</span>
              </h1>
              <p className="text-[11px] text-neutral-400 font-mono hidden sm:block">
                Web Developer &amp; Prototyper
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={scrollToProjects}
              className="text-sm text-neutral-300 hover:text-white transition-colors hidden md:block"
            >
              Projects
            </button>
            <button 
              onClick={scrollToContact}
              className="text-sm text-neutral-300 hover:text-white transition-colors hidden md:block"
            >
              Contact
            </button>

            {/* Quick Social Icons in Navbar */}
            <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-white/10">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-emerald-500/10 text-neutral-400 hover:text-emerald-400 rounded-lg transition-colors"
                title="Chat on WhatsApp (+8801743904049)"
              >
                <MessageCircle size={17} />
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-sky-500/10 text-neutral-400 hover:text-sky-400 rounded-lg transition-colors"
                title="Facebook Profile"
              >
                <Facebook size={17} />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-pink-500/10 text-neutral-400 hover:text-pink-400 rounded-lg transition-colors"
                title="Instagram Profile"
              >
                <Instagram size={17} />
              </a>
            </div>

            {isAdmin && (
              <button 
                onClick={() => openModal()}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm font-semibold"
              >
                <Plus size={16} />
                <span>Add Project</span>
              </button>
            )}
            
            {user ? (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold border border-emerald-500/20 text-sm">
                  {user.email?.[0].toUpperCase()}
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Error Banner */}
      {(error || isOffline) && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 text-center">
          <p className="text-red-400 text-sm flex items-center justify-center gap-2">
            <AlertCircle size={16} />
            {isOffline 
              ? "Firebase is offline. Please ensure you have created a Firestore database in your Firebase Console and the API is enabled." 
              : error}
          </p>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-20 pb-20 px-6 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[28rem] bg-emerald-500/10 blur-[130px] rounded-full -z-10 pointer-events-none" 
        />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 text-center lg:text-left"
            >
              {/* Status pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-xs text-neutral-300 mb-6 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Independent Web Developer &amp; Software Prototyper</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tighter mb-6 leading-[1]">
                Shahriar Islam <br className="hidden sm:inline" />
                <motion.span 
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                  className="text-emerald-500"
                >
                  Ratul
                </motion.span>
              </h1>

              {/* Requested Biography */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-neutral-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed font-normal"
              >
                I am an independent web developer in the path of mastery of the art of modern software prototyping. Since 2025, I have been learning how to use Vibe coding and LLMs in the creation of web apps. I try to be fast in my prototyping by using my powers of thinking and prompting in tandem with my knowledge of web dev.
              </motion.p>

              {/* Action buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 mb-8"
              >
                <button
                  onClick={scrollToProjects}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                >
                  <span>Explore Projects</span>
                  <ArrowRight size={16} />
                </button>

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 font-medium px-5 py-3 rounded-xl transition-all shadow-lg hover:border-emerald-400/50"
                  title="Direct WhatsApp Inbox with default message"
                >
                  <MessageCircle size={16} className="text-emerald-400" />
                  <span>WhatsApp Me</span>
                </a>

                <button
                  onClick={scrollToContact}
                  className="inline-flex items-center gap-2 glass hover:bg-white/10 text-neutral-200 font-medium px-5 py-3 rounded-xl transition-all border border-white/10 text-sm"
                >
                  <Mail size={16} className="text-emerald-400" />
                  <span>Get In Touch</span>
                </button>
              </motion.div>

              {/* Social Quick Pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-4 border-t border-white/5"
              >
                <span className="text-xs text-neutral-500 font-mono mr-1">Connect:</span>
                
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs text-neutral-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors"
                >
                  <MessageCircle size={13} className="text-emerald-400" />
                  <span>WhatsApp: {WHATSAPP_NUMBER}</span>
                </a>

                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs text-neutral-300 hover:text-sky-400 hover:border-sky-500/30 transition-colors"
                >
                  <Facebook size={13} className="text-sky-400" />
                  <span>Facebook</span>
                </a>

                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs text-neutral-300 hover:text-pink-400 hover:border-pink-500/30 transition-colors"
                >
                  <Instagram size={13} className="text-pink-400" />
                  <span>Instagram</span>
                </a>

                <button
                  onClick={copyEmail}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs text-neutral-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors"
                  title="Click to copy email"
                >
                  {copiedEmail ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Mail size={13} className="text-emerald-400" />
                      <span>{ADMIN_EMAIL}</span>
                    </>
                  )}
                </button>
              </motion.div>
            </motion.div>

            {/* Right Photo Column with Attractive Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 flex justify-center items-center"
            >
              <AnimatedProfilePhoto 
                name="Shahriar Islam Ratul" 
                title="Independent Web Developer & Software Prototyper" 
              />
            </motion.div>
          </div>

          {/* 3 Core Pillars */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mt-16"
          >
            <div className="glass rounded-2xl p-5 border border-white/5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3 border border-emerald-500/20">
                <Sparkles size={18} />
              </div>
              <h2 className="text-sm font-bold text-white mb-1">Vibe Coding &amp; LLMs</h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Leveraging LLMs and conversational coding since 2025 to synthesize web applications rapidly.
              </p>
            </div>

            <div className="glass rounded-2xl p-5 border border-white/5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3 border border-emerald-500/20">
                <Zap size={18} />
              </div>
              <h2 className="text-sm font-bold text-white mb-1">Rapid Prototyping</h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Translating concepts into functional, interactive software prototypes with speed and agility.
              </p>
            </div>

            <div className="glass rounded-2xl p-5 border border-white/5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3 border border-emerald-500/20">
                <Code2 size={18} />
              </div>
              <h2 className="text-sm font-bold text-white mb-1">Thought &amp; Web Dev</h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Combining structured prompting and creative thinking in tandem with modern web engineering.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projects Section */}
      <main id="projects" className="max-w-7xl mx-auto px-6 pb-24 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-white/5 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">
              <LayoutGrid size={14} />
              <span>Showcase</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
              Featured Projects &amp; Prototypes
            </h2>
            <p className="text-neutral-400 text-sm mt-1">
              Web applications and interactive prototypes demonstrating modern prototyping workflows.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 glass rounded-full text-xs text-neutral-300">
              <LayoutGrid size={14} className="text-emerald-500" />
              {displayProjects.length} Projects
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400">
                <Settings size={14} className="animate-spin-slow" />
                Admin Mode
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {displayProjects.map((project, index) => (
              <motion.div
                key={project.id || index}
                layout
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.06,
                  ease: [0.16, 1, 0.3, 1]
                }}
                whileHover={{ y: -6 }}
                className="group glass rounded-2xl overflow-hidden glass-hover flex flex-col border border-white/5"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={project.imageUrl} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-6">
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      whileHover={{ y: 0, opacity: 1 }}
                      className="flex gap-3 w-full"
                    >
                      {project.demoUrl && (
                        <a 
                          href={project.demoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 bg-white text-black py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors shadow-xl"
                        >
                          <ExternalLink size={16} /> Live Demo
                        </a>
                      )}
                    </motion.div>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold font-display">{project.title}</h3>
                    {isAdmin && project.id && !project.id.startsWith('prototype-') && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openModal(project)}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-emerald-400 transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(project.id!)}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <ProjectDescription text={project.description} />

                  {project.demoUrl && (
                    <a 
                      href={project.demoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-bold transition-all mb-4 group/btn"
                    >
                      Visit Website 
                      <ExternalLink size={14} className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </a>
                  )}

                  <div className="mt-auto pt-4 border-t border-white/5">
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.split(',').map((tech, i) => (
                        <span key={i} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-white/5 rounded-md text-neutral-400">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {displayProjects.length === 0 && (
          <div className="text-center py-20 glass rounded-3xl">
            <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Code2 className="text-neutral-600 w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">No projects yet</h3>
            <p className="text-neutral-500">Check back later or add your first project.</p>
          </div>
        )}

        {/* Dedicated Contact Section */}
        <ContactSection />
      </main>

      {/* Admin Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl glass rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-display font-bold">
                  {editingProject ? 'Edit Project' : 'Add New Project'}
                </h3>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-white/5 rounded-full text-neutral-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5 ml-1">Title</label>
                  <input 
                    required
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    placeholder="Project Title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5 ml-1">Description</label>
                  <textarea 
                    required
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                    placeholder="Short project description..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5 ml-1">Image URL</label>
                    <input 
                      required
                      type="url"
                      value={formData.imageUrl}
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors"
                      placeholder="Direct image link"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5 ml-1">Tech Stack</label>
                    <input 
                      type="text"
                      value={formData.techStack}
                      onChange={e => setFormData({...formData, techStack: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors"
                      placeholder="React, Tailwind, Firebase"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5 ml-1">Demo URL</label>
                    <input 
                      type="url"
                      value={formData.demoUrl}
                      onChange={e => setFormData({...formData, demoUrl: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors"
                      placeholder="Live demo link"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 mt-4"
                >
                  {editingProject ? 'Update Project' : 'Publish Project'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md glass rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-display font-bold">Admin Login</h3>
                <button 
                  onClick={() => setIsLoginModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-neutral-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5 ml-1">Email</label>
                  <input 
                    required
                    type="email"
                    value={loginData.email}
                    onChange={e => setLoginData({...loginData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5 ml-1">Password</label>
                  <input 
                    required
                    type="password"
                    value={loginData.password}
                    onChange={e => setLoginData({...loginData, password: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 mt-4 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                  ) : (
                    "Login"
                  )}
                </button>
                <p className="text-center text-xs text-neutral-500">
                  Authorized access only.
                </p>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center items-center gap-4">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 glass rounded-full text-xs text-neutral-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors"
            >
              <MessageCircle size={14} className="text-emerald-400" />
              <span>WhatsApp: {WHATSAPP_NUMBER}</span>
            </a>

            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 glass rounded-full text-xs text-neutral-300 hover:text-sky-400 hover:border-sky-500/30 transition-colors"
            >
              <Facebook size={14} className="text-sky-400" />
              <span>Facebook</span>
            </a>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 glass rounded-full text-xs text-neutral-300 hover:text-pink-400 hover:border-pink-500/30 transition-colors"
            >
              <Instagram size={14} className="text-pink-400" />
              <span>Instagram</span>
            </a>

            <a
              href={`mailto:${ADMIN_EMAIL}`}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 glass rounded-full text-xs text-neutral-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors"
            >
              <Mail size={14} className="text-emerald-400" />
              <span>{ADMIN_EMAIL}</span>
            </a>
          </div>

          <motion.p 
            whileTap={{ scale: 0.95 }}
            onClick={() => setSecretClickCount(prev => prev + 1)}
            className="text-neutral-500 text-xs sm:text-sm cursor-default select-none"
            title="Shahriar Islam Ratul"
          >
            © {new Date().getFullYear()} Shahriar Islam Ratul. Built with passion &amp; Vibe coding.
          </motion.p>
        </div>
      </footer>

      {/* Scroll to Top Floating Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            id="scroll-to-top-button"
            key="scroll-to-top"
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 20 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            title="Scroll to top"
            className="fixed bottom-8 right-8 z-40 p-3.5 glass rounded-2xl text-neutral-300 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10 shadow-2xl shadow-black/50 transition-colors backdrop-blur-md group focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <ArrowUp size={20} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <PortfolioApp />
    </ErrorBoundary>
  );
}
