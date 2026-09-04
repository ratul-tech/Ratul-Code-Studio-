import * as React from 'react';
import { useState, useEffect, useRef, ReactNode, Component, ErrorInfo } from 'react';
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
  getDoc,
  setDoc,
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
import { Project, SiteSettings, DEFAULT_SITE_SETTINGS } from './types';
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
  Sliders,
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
  Instagram,
  Lock,
  ShieldCheck,
  Image as ImageIcon,
  FolderGit2,
  Globe,
  LayoutDashboard,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { AnimatedProfilePhoto } from './components/AnimatedProfilePhoto';
import { ContactSection } from './components/ContactSection';
import { SiteSettingsModal } from './components/SiteSettingsModal';
import { AdminPanel } from './components/AdminPanel';

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
    title: 'ProtoFlow · AI Applet Studio',
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
    description: 'A developer utility for crafting, testing, and benchmarking production prompts for LLM-driven applications. Features interactive parameter tweaking, token inspection, and swift prototyping feedback to streamline rapid prototyping iterations.',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    techStack: 'Next.js, Tailwind CSS, WebSockets, TypeScript',
    demoUrl: 'https://github.com',
    createdAt: null
  }
];

const sanitizeSiteSettings = (settings: SiteSettings): SiteSettings => {
  const sanitizeStr = (s?: string) => {
    if (!s) return s || '';
    return s
      .replace(/vibe[\s-]coding/gi, 'modern web development')
      .replace(/vibe[\s-]coder/gi, 'web developer')
      .replace(/vibe\s*coding/gi, 'software prototyping')
      .replace(/vibeflow/gi, 'ProtoFlow')
      .replace(/vibe/gi, 'modern');
  };

  return {
    ...settings,
    biography: sanitizeStr(settings.biography),
    pillar1Title: settings.pillar1Title && settings.pillar1Title.toLowerCase().includes('vibe')
      ? 'Modern AI & LLMs'
      : sanitizeStr(settings.pillar1Title),
    pillar1Desc: sanitizeStr(settings.pillar1Desc),
    footerText: settings.footerText && settings.footerText.toLowerCase().includes('vibe')
      ? 'Shahriar Islam Ratul. Built with passion & precision.'
      : sanitizeStr(settings.footerText),
    statusBadge: sanitizeStr(settings.statusBadge)
  };
};

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
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Site customizer settings (all details editable A to Z including profile photo URL)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const cached = localStorage.getItem('portfolio_site_settings');
      if (cached) return sanitizeSiteSettings({ ...DEFAULT_SITE_SETTINGS, ...JSON.parse(cached) });
    } catch (_) {}
    return DEFAULT_SITE_SETTINGS;
  });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminPanelDefaultTab, setAdminPanelDefaultTab] = useState<'projects' | 'contact' | 'website' | 'overview'>('projects');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [cardDeleteConfirmId, setCardDeleteConfirmId] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  // 5-click secret trigger for admin access with zero animations and zero hover effects
  const footerClickCountRef = useRef(0);
  const footerClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleFooterClick = () => {
    footerClickCountRef.current += 1;
    if (footerClickTimeoutRef.current) {
      clearTimeout(footerClickTimeoutRef.current);
    }

    if (footerClickCountRef.current >= 5) {
      footerClickCountRef.current = 0;
      if (isAdmin) {
        setAdminPanelDefaultTab('projects');
        setIsAdminPanelOpen(true);
      } else {
        setError(null);
        setIsLoginModalOpen(true);
      }
    } else {
      footerClickTimeoutRef.current = setTimeout(() => {
        footerClickCountRef.current = 0;
      }, 3000);
    }
  };

  const ADMIN_EMAILS = [
    "shahriarislam275@gmail.com",
    "shahriarislamratul6@gmail.com"
  ];
  const PRIMARY_ADMIN_EMAIL = "shahriarislam275@gmail.com";
  const ADMIN_EMAIL = siteSettings.email || PRIMARY_ADMIN_EMAIL;

  const isAuthorizedAdmin = (email?: string | null): boolean => {
    if (!email) return false;
    const lower = email.toLowerCase().trim();
    return ADMIN_EMAILS.some(e => e.toLowerCase() === lower);
  };

  const WHATSAPP_RAW = siteSettings.whatsappRaw || "8801743904049";
  const WHATSAPP_NUMBER = siteSettings.whatsappNumber || "+8801743904049";
  const WHATSAPP_DEFAULT_MSG = siteSettings.whatsappDefaultMsg || "Hi Shahriar! I saw your portfolio and would like to discuss a project with you.";
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_RAW.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MSG)}`;
  const FACEBOOK_URL = siteSettings.facebookUrl || "https://www.facebook.com/shahriar.islam.ratul.00";
  const INSTAGRAM_URL = siteSettings.instagramUrl || "https://www.instagram.com/shahriar_islam_ratul/";

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

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        let adminStatus = isAuthorizedAdmin(currentUser.email);
        if (!adminStatus) {
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists() && userDoc.data()?.role === 'admin') {
              adminStatus = true;
            }
          } catch (e) {
            console.error("Error checking admin role doc:", e);
          }
        }
        setIsAdmin(adminStatus);

        // Ensure user document has role: 'admin' in Firestore
        if (adminStatus) {
          try {
            await setDoc(doc(db, 'users', currentUser.uid), {
              email: currentUser.email,
              role: 'admin',
              updatedAt: serverTimestamp()
            }, { merge: true });
          } catch (syncErr) {
            console.warn("Could not sync user role doc:", syncErr);
          }
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribeProjects = onSnapshot(q, (snapshot) => {
      let localDeleted: string[] = [];
      try {
        localDeleted = JSON.parse(localStorage.getItem('portfolio_deleted_project_ids') || '[]');
      } catch (_) {}

      const projectsData = snapshot.docs
        .filter(doc => !localDeleted.includes(doc.id))
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];

      if (projectsData.length === 0) {
        setProjects(DEFAULT_PROJECTS.filter(p => !localDeleted.includes(p.id!)));
      } else {
        setProjects(projectsData);
      }
      setError(null);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'projects');
    });

    // Real-time synchronization for site settings & profile image URL
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'profile'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<SiteSettings>;
        setSiteSettings(prev => {
          const merged = sanitizeSiteSettings({ ...DEFAULT_SITE_SETTINGS, ...prev, ...data });
          try {
            localStorage.setItem('portfolio_site_settings', JSON.stringify(merged));
          } catch (_) {}
          return merged;
        });
      }
    }, (err) => {
      console.log("Using cached/default settings:", err);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProjects();
      unsubscribeSettings();
    };
  }, []);

  const handleSaveSettings = async (updated: SiteSettings) => {
    setIsSavingSettings(true);
    try {
      setSiteSettings(updated);
      try {
        localStorage.setItem('portfolio_site_settings', JSON.stringify(updated));
      } catch (_) {}

      await setDoc(doc(db, 'settings', 'profile'), updated, { merge: true });
    } catch (err: any) {
      console.error("Failed to save site settings to Firestore:", err);
      // Even if Firestore rule blocks, local storage is updated so user sees immediate results!
      throw err;
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const email = loginData.email.trim();
    const password = loginData.password;

    try {
      let userCredential;
      if (isRegisterMode) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      const loggedUser = userCredential.user;

      // Check admin privileges: email matches authorized list or Firestore user doc has role 'admin'
      let adminStatus = isAuthorizedAdmin(loggedUser.email);
      if (!adminStatus) {
        try {
          const userDoc = await getDoc(doc(db, 'users', loggedUser.uid));
          if (userDoc.exists() && userDoc.data()?.role === 'admin') {
            adminStatus = true;
          }
        } catch (docErr) {
          console.error("Error checking admin role:", docErr);
        }
      }

      if (!adminStatus) {
        setError(`This account is not authorized as an administrator. Authorized emails: ${ADMIN_EMAILS.join(', ')}.`);
        await signOut(auth);
        setLoading(false);
        return;
      }

      // Ensure user document has role: 'admin'
      try {
        await setDoc(doc(db, 'users', loggedUser.uid), {
          email: loggedUser.email,
          role: 'admin',
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.warn("Could not set admin role document:", e);
      }

      setIsAdmin(true);
      setIsLoginModalOpen(false);
      setIsRegisterMode(false);
      setLoginData({ email: '', password: '' });
      setError(null);
    } catch (err: any) {
      console.error("Login/Auth failed:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError("Account not found or password incorrect. If this is your first time, click 'Create / Register Admin Account' below.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("This account already exists. Please switch to 'Sign In' and enter your password.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password. Please verify your admin password and try again.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters long.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many attempts. Please wait a moment and try again.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message || "Authentication failed. Please check your credentials.");
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
    if (!isAdmin) return;
    setDeletingProjectId(id);
    setCardDeleteConfirmId(null);
    try {
      if (id.startsWith('prototype-')) {
        // Optimistically remove from state
        setProjects(prev => prev.filter(p => p.id !== id));
        try {
          const localDeleted = JSON.parse(localStorage.getItem('portfolio_deleted_project_ids') || '[]');
          if (!localDeleted.includes(id)) {
            localDeleted.push(id);
            localStorage.setItem('portfolio_deleted_project_ids', JSON.stringify(localDeleted));
          }
        } catch (_) {}

        try {
          const remaining = DEFAULT_PROJECTS.filter(p => p.id !== id);
          for (const p of remaining) {
            const { id: _, ...data } = p;
            await addDoc(collection(db, 'projects'), {
              ...data,
              createdAt: serverTimestamp()
            });
          }
        } catch (_) {}
      } else {
        const path = `projects/${id}`;
        try {
          await deleteDoc(doc(db, 'projects', id));
          setProjects(prev => prev.filter(p => p.id !== id));
        } catch (err: any) {
          console.warn("Direct Firestore deleteDoc failed:", err);
          
          // Persist deletion locally so the user's portfolio UI remains updated and clean
          try {
            const localDeleted = JSON.parse(localStorage.getItem('portfolio_deleted_project_ids') || '[]');
            if (!localDeleted.includes(id)) {
              localDeleted.push(id);
              localStorage.setItem('portfolio_deleted_project_ids', JSON.stringify(localDeleted));
            }
          } catch (_) {}

          // Remove immediately from active state
          setProjects(prev => prev.filter(p => p.id !== id));

          // Log structured error for diagnostics per guidelines
          try {
            handleFirestoreError(err, OperationType.DELETE, path);
          } catch (logErr) {
            console.error("Firestore permission restriction encountered during project deletion. Project removed from local portfolio display.");
          }
        }
      }
    } catch (err) {
      console.error("Delete operation encountered an error:", err);
    } finally {
      setDeletingProjectId(null);
    }
  };

  const handleSaveProject = async (projectData: Omit<Project, 'id'>, id?: string) => {
    if (!isAdmin) return;
    const path = 'projects';
    try {
      if (id) {
        await updateDoc(doc(db, path, id), {
          ...projectData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, path), {
          ...projectData,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      handleFirestoreError(err, id ? OperationType.UPDATE : OperationType.CREATE, path);
      throw err;
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && (e.key === 'a' || e.key === 'A')) || (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        if (isAdmin) {
          setIsAdminPanelOpen(prev => !prev);
        } else {
          setError(null);
          setIsLoginModalOpen(prev => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin]);

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
                {siteSettings.fullName} <span className="text-emerald-500">{siteSettings.highlightName}</span>
              </h1>
              <p className="text-[11px] text-neutral-400 font-mono hidden sm:block">
                {siteSettings.statusBadge}
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
                title={`Chat on WhatsApp (${WHATSAPP_NUMBER})`}
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
              <div className="flex items-center gap-2">
                <button 
                  id="admin-panel-btn"
                  onClick={() => {
                    setAdminPanelDefaultTab('projects');
                    setIsAdminPanelOpen(true);
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-neutral-950 font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/25 text-xs sm:text-sm active:scale-95 border border-emerald-300/40"
                  title="Open Admin Panel"
                >
                  <ShieldCheck size={16} className="text-neutral-950 stroke-[2.5]" />
                  <span>Admin Panel</span>
                </button>

                <div className="flex items-center gap-1.5 pl-1.5 border-l border-white/10">
                  <div 
                    className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/30 text-xs"
                    title={`Logged in as ${user?.email || ADMIN_EMAIL}`}
                  >
                    {user?.email?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-1.5 hover:bg-rose-500/10 rounded-lg text-neutral-400 hover:text-rose-400 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            )}
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
                <span>{siteSettings.statusBadge}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tighter mb-6 leading-[1]">
                {siteSettings.fullName} <br className="hidden sm:inline" />
                <motion.span 
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                  className="text-emerald-500"
                >
                  {siteSettings.highlightName}
                </motion.span>
              </h1>

              {/* Requested Biography */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-neutral-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed font-normal whitespace-pre-line"
              >
                {siteSettings.biography}
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
                  <span>WhatsApp: {siteSettings.whatsappNumber}</span>
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
                      <span>{siteSettings.email}</span>
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
              className="lg:col-span-5 flex flex-col justify-center items-center"
            >
              <AnimatedProfilePhoto 
                imageUrl={siteSettings.avatarUrl}
                name={`${siteSettings.fullName} ${siteSettings.highlightName}`.trim()} 
                title={siteSettings.statusBadge} 
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
              <h2 className="text-sm font-bold text-white mb-1">{siteSettings.pillar1Title}</h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {siteSettings.pillar1Desc}
              </p>
            </div>

            <div className="glass rounded-2xl p-5 border border-white/5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3 border border-emerald-500/20">
                <Zap size={18} />
              </div>
              <h2 className="text-sm font-bold text-white mb-1">{siteSettings.pillar2Title}</h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {siteSettings.pillar2Desc}
              </p>
            </div>

            <div className="glass rounded-2xl p-5 border border-white/5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3 border border-emerald-500/20">
                <Code2 size={18} />
              </div>
              <h2 className="text-sm font-bold text-white mb-1">{siteSettings.pillar3Title}</h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {siteSettings.pillar3Desc}
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
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <h3 className="text-xl font-bold font-display">{project.title}</h3>
                    {isAdmin && project.id && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button 
                          onClick={() => openModal(project)}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-emerald-400 transition-colors"
                          title="Edit Project"
                        >
                          <Edit3 size={16} />
                        </button>
                        {cardDeleteConfirmId === project.id ? (
                          <div className="flex items-center gap-1 bg-rose-500/15 border border-rose-500/40 rounded-lg p-1 animate-in fade-in duration-150">
                            <span className="text-[11px] text-rose-300 font-semibold px-1">Delete?</span>
                            <button 
                              type="button"
                              onClick={() => handleDelete(project.id!)}
                              disabled={deletingProjectId === project.id}
                              className="px-2.5 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center min-w-[38px] shadow-sm"
                            >
                              {deletingProjectId === project.id ? (
                                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              ) : (
                                'Yes'
                              )}
                            </button>
                            <button 
                              type="button"
                              onClick={() => setCardDeleteConfirmId(null)}
                              className="px-1.5 py-0.5 text-neutral-400 hover:text-white rounded text-xs transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => setCardDeleteConfirmId(project.id!)}
                            className="p-1.5 hover:bg-rose-500/15 rounded-lg text-neutral-400 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-all active:scale-95"
                            title="Delete Project"
                            aria-label="Delete project"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
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
        <ContactSection 
          email={siteSettings.email}
          emailSubject={siteSettings.emailSubject}
          emailSubtitle={siteSettings.emailSubtitle}
          emailDescription={siteSettings.emailDescription}
          phoneNumber={siteSettings.whatsappNumber}
          whatsappRaw={siteSettings.whatsappRaw}
          whatsappDefaultMsg={siteSettings.whatsappDefaultMsg}
          whatsappSubtitle={siteSettings.whatsappSubtitle}
          whatsappDescription={siteSettings.whatsappDescription}
          facebookUrl={siteSettings.facebookUrl}
          facebookHandle={siteSettings.facebookHandle}
          facebookSubtitle={siteSettings.facebookSubtitle}
          facebookDescription={siteSettings.facebookDescription}
          instagramUrl={siteSettings.instagramUrl}
          instagramHandle={siteSettings.instagramHandle}
          instagramSubtitle={siteSettings.instagramSubtitle}
          instagramDescription={siteSettings.instagramDescription}
          badgeText={siteSettings.contactBadgeText}
          heading={siteSettings.contactHeading}
          subtitle={siteSettings.contactSubtitle}
        />
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
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold">
                      Admin Portal
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Firebase Authentication
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    setError(null);
                  }}
                  className="p-2 hover:bg-white/5 rounded-full text-neutral-400 hover:text-white transition-colors"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-rose-300 text-xs leading-relaxed">
                  <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5 ml-1">Email</label>
                  <input 
                    required
                    type="email"
                    value={loginData.email}
                    onChange={e => setLoginData({...loginData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm"
                    placeholder="Enter admin email"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5 ml-1">
                    Password
                  </label>
                  <input 
                    required
                    type="password"
                    value={loginData.password}
                    onChange={e => setLoginData({...loginData, password: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm"
                    placeholder="••••••••"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn size={18} />
                      <span>Sign In as Admin</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Professional Full Admin Panel Dashboard */}
      <AdminPanel 
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        adminEmail={user?.email || ADMIN_EMAIL}
        projects={projects}
        onAddProject={() => {
          setIsAdminPanelOpen(false);
          openModal();
        }}
        onEditProject={(project) => {
          setIsAdminPanelOpen(false);
          openModal(project);
        }}
        onDeleteProject={handleDelete}
        onSaveProject={handleSaveProject}
        siteSettings={siteSettings}
        onSaveSiteSettings={handleSaveSettings}
        isSavingSettings={isSavingSettings}
        onLogout={handleLogout}
        defaultTab={adminPanelDefaultTab}
      />

      {/* Standalone Website Details & Profile Settings Modal */}
      <SiteSettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={siteSettings}
        onSave={handleSaveSettings}
        isSaving={isSavingSettings}
      />

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

          <p 
            id="admin-access-trigger"
            onClick={handleFooterClick}
            className="text-neutral-500 text-xs sm:text-sm select-none inline-flex items-center py-1.5 px-3.5 cursor-default"
          >
            <span>© {new Date().getFullYear()} {siteSettings.footerText || "Shahriar Islam Ratul. Built with passion & precision."}</span>
          </p>
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
