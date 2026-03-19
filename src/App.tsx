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
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

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

// --- Main Application ---

function PortfolioApp() {
  const [projects, setProjects] = useState<Project[]>([]);
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
  const ADMIN_EMAIL = "shahriarislam275@gmail.com";
  const DEFAULT_ADMIN_PASSWORD = "shahriarislam275@gmail.com";

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

  return (
    <div className="min-h-screen font-sans">
      {/* Header */}
      <nav className="sticky top-0 z-40 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Code2 className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-display font-bold tracking-tight">
              Ratul <span className="text-emerald-500">Code Studio</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <button 
                onClick={() => openModal()}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Project</span>
              </button>
            )}
            
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold border border-emerald-500/20">
                  {user.email?.[0].toUpperCase()}
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
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
      <section className="relative py-32 px-6 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-emerald-500/10 blur-[120px] rounded-full -z-10" 
        />
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-6xl sm:text-8xl font-display font-bold tracking-tighter mb-8 leading-[0.9]">
              Crafting Digital <br />
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-emerald-500"
              >
                Experiences
              </motion.span>
            </h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="text-neutral-400 text-xl max-w-2xl mx-auto mb-12 font-light"
            >
              A collection of premium web applications, creative experiments, and full-stack solutions built with precision and passion.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center gap-4"
            >
              <div className="flex items-center gap-2 px-5 py-2.5 glass rounded-full text-sm text-neutral-300">
                <LayoutGrid size={16} className="text-emerald-500" />
                {projects.length} Projects
              </div>
              {isAdmin && (
                <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-400">
                  <Settings size={16} className="animate-spin-slow" />
                  Admin Mode
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.05,
                  ease: [0.16, 1, 0.3, 1]
                }}
                whileHover={{ y: -8 }}
                className="group glass rounded-2xl overflow-hidden glass-hover flex flex-col"
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
                    {isAdmin && (
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
                        <span key={i} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-white/5 rounded-md text-neutral-500">
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

        {projects.length === 0 && (
          <div className="text-center py-20 glass rounded-3xl">
            <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Code2 className="text-neutral-600 w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">No projects yet</h3>
            <p className="text-neutral-500">Check back later or add your first project.</p>
          </div>
        )}
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
      <footer className="py-12 border-t border-white/5 text-center">
        <motion.p 
          whileTap={{ scale: 0.95 }}
          onClick={() => setSecretClickCount(prev => prev + 1)}
          className="text-neutral-500 text-sm cursor-default select-none"
        >
          © {new Date().getFullYear()} Ratul Code Studio. Built with passion.
        </motion.p>
      </footer>
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
