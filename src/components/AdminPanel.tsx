import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  LayoutDashboard, 
  FolderGit2, 
  Globe, 
  Sliders, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  RotateCcw, 
  Check, 
  ExternalLink, 
  AlertCircle, 
  LogOut, 
  ShieldCheck, 
  Sparkles, 
  Image as ImageIcon, 
  User, 
  Phone, 
  MessageCircle, 
  Eye, 
  Database,
  Layers,
  Code2
} from 'lucide-react';
import { Project, SiteSettings, DEFAULT_SITE_SETTINGS } from '../types';
import profilePhoto from '../assets/images/ratul_profile.jpg';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  adminEmail: string;
  projects: Project[];
  onAddProject?: () => void;
  onEditProject?: (project: Project) => void;
  onDeleteProject: (id: string) => Promise<void>;
  onSaveProject?: (projectData: Omit<Project, 'id'>, id?: string) => Promise<void>;
  siteSettings: SiteSettings;
  onSaveSiteSettings: (updated: SiteSettings) => Promise<void>;
  isSavingSettings: boolean;
  onLogout: () => void;
  defaultTab?: 'projects' | 'website' | 'overview';
}

export function AdminPanel({
  isOpen,
  onClose,
  adminEmail,
  projects,
  onAddProject,
  onEditProject,
  onDeleteProject,
  onSaveProject,
  siteSettings,
  onSaveSiteSettings,
  isSavingSettings,
  onLogout,
  defaultTab = 'projects'
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'website' | 'overview'>(defaultTab);
  const [siteForm, setSiteForm] = useState<SiteSettings>(siteSettings);
  const [websiteSubTab, setWebsiteSubTab] = useState<'profile' | 'contact' | 'pillars'>('profile');
  const [imgError, setImgError] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Embedded Project Editor State inside Admin Panel
  const [projectEditorMode, setProjectEditorMode] = useState<'list' | 'form'>('list');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectFormData, setProjectFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    techStack: '',
    demoUrl: ''
  });
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [projectImgError, setProjectImgError] = useState(false);
  const [isResetConfirm, setIsResetConfirm] = useState(false);

  useEffect(() => {
    setSiteForm(siteSettings);
    setImgError(false);
    setSaveSuccess(false);
    setErrorMessage(null);
  }, [siteSettings, isOpen]);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, isOpen]);

  if (!isOpen) return null;

  const handleSaveWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await onSaveSiteSettings(siteForm);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save website details');
    }
  };

  const handleResetDefaults = () => {
    setSiteForm(DEFAULT_SITE_SETTINGS);
    setImgError(false);
    setIsResetConfirm(false);
  };

  const handleOpenAddProject = () => {
    setEditingProjectId(null);
    setProjectFormData({
      title: '',
      description: '',
      imageUrl: '',
      techStack: '',
      demoUrl: ''
    });
    setProjectImgError(false);
    setProjectEditorMode('form');
  };

  const handleOpenEditProject = (project: Project) => {
    setEditingProjectId(project.id || null);
    setProjectFormData({
      title: project.title,
      description: project.description,
      imageUrl: project.imageUrl,
      techStack: project.techStack || '',
      demoUrl: project.demoUrl || ''
    });
    setProjectImgError(false);
    setProjectEditorMode('form');
  };

  const handleProjectFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectFormData.title.trim() || !projectFormData.imageUrl.trim()) {
      setErrorMessage("Please fill in the project title and image URL.");
      return;
    }

    setIsSavingProject(true);
    setErrorMessage(null);
    try {
      if (onSaveProject) {
        await onSaveProject(projectFormData, editingProjectId || undefined);
      } else if (editingProjectId && onEditProject) {
        onEditProject({ ...projectFormData, id: editingProjectId });
      } else if (onAddProject) {
        onAddProject();
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      setProjectEditorMode('list');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save project');
    } finally {
      setIsSavingProject(false);
    }
  };

  const activePhotoSrc = siteForm.avatarUrl && siteForm.avatarUrl.trim() && !imgError
    ? siteForm.avatarUrl.trim()
    : profilePhoto;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md"
        />

        {/* Professional Admin Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="relative w-full max-w-5xl glass rounded-3xl shadow-2xl border border-white/15 my-auto max-h-[94vh] flex flex-col overflow-hidden bg-neutral-900/95"
        >
          {/* Top Bar / Header */}
          <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-white/10 shrink-0 bg-neutral-950/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-inner">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-display font-bold text-white tracking-tight">
                    Professional Admin Panel
                  </h2>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Verified Admin
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono">
                  {adminEmail}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onClose}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <Eye size={14} />
                <span>View Live Site</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                title="Sign Out"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>

              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition-colors"
                aria-label="Close Admin Panel"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Bar (Tabs) */}
          <div className="flex items-center justify-between px-5 sm:px-7 py-2.5 border-b border-white/10 shrink-0 bg-neutral-950/30 overflow-x-auto gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('projects')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'projects'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FolderGit2 size={16} />
                <span>Projects Manager</span>
                <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-black/20 text-white">
                  {projects.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('website')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'website'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Globe size={16} />
                <span>Website &amp; Profile Details</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard size={16} />
                <span>Overview &amp; Stats</span>
              </button>
            </div>

            {activeTab === 'projects' && (
              <button
                type="button"
                onClick={handleOpenAddProject}
                className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-md shadow-emerald-500/20 shrink-0"
              >
                <Plus size={15} />
                <span>Add Project</span>
              </button>
            )}
          </div>

          {/* Feedback alerts */}
          {saveSuccess && (
            <div className="mx-5 sm:mx-7 mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-300 text-xs shrink-0">
              <Check size={16} className="text-emerald-400 shrink-0" />
              <span>Saved successfully! Changes are immediately live on your portfolio.</span>
            </div>
          )}

          {errorMessage && (
            <div className="mx-5 sm:mx-7 mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs shrink-0">
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7">
            {/* TAB 1: PROJECTS MANAGER */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                {projectEditorMode === 'form' ? (
                  /* Embedded Project Edit / Create Form */
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setProjectEditorMode('list')}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors"
                          title="Back to Projects List"
                        >
                          <RotateCcw size={15} />
                        </button>
                        <div>
                          <h3 className="text-base font-bold text-white">
                            {editingProjectId ? 'Edit Project' : 'Create New Project'}
                          </h3>
                          <p className="text-xs text-neutral-400">
                            {editingProjectId ? 'Update project details, cover photo, tech stack, or live link.' : 'Fill out details to publish a new project to your portfolio.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setProjectEditorMode('list')}
                          className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold border border-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleProjectFormSubmit}
                          disabled={isSavingProject || !projectFormData.title.trim() || !projectFormData.imageUrl.trim()}
                          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-1.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                        >
                          {isSavingProject ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <Save size={14} />
                              <span>{editingProjectId ? 'Update Project' : 'Publish Project'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleProjectFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-7 space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                            Project Title *
                          </label>
                          <input
                            required
                            type="text"
                            value={projectFormData.title}
                            onChange={e => setProjectFormData({ ...projectFormData, title: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm"
                            placeholder="e.g. Modern E-Commerce Platform"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                            Project Description *
                          </label>
                          <textarea
                            required
                            rows={4}
                            value={projectFormData.description}
                            onChange={e => setProjectFormData({ ...projectFormData, description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm resize-none leading-relaxed"
                            placeholder="Describe what the project does, key features, challenges solved..."
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                            Cover Image URL *
                          </label>
                          <input
                            required
                            type="url"
                            value={projectFormData.imageUrl}
                            onChange={e => {
                              setProjectFormData({ ...projectFormData, imageUrl: e.target.value });
                              setProjectImgError(false);
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm"
                            placeholder="https://images.unsplash.com/... or direct image link"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                              Tech Stack
                            </label>
                            <input
                              type="text"
                              value={projectFormData.techStack}
                              onChange={e => setProjectFormData({ ...projectFormData, techStack: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm"
                              placeholder="React, TypeScript, Tailwind"
                            />
                            <p className="text-[11px] text-neutral-500 mt-1">Separate with commas</p>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                              Live Demo URL
                            </label>
                            <input
                              type="url"
                              value={projectFormData.demoUrl}
                              onChange={e => setProjectFormData({ ...projectFormData, demoUrl: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm"
                              placeholder="https://my-app.com"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right column: Card Preview */}
                      <div className="lg:col-span-5 space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                          Live Card Preview
                        </label>
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col space-y-3">
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-800 border border-white/10">
                            {projectFormData.imageUrl && !projectImgError ? (
                              <img
                                src={projectFormData.imageUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={() => setProjectImgError(true)}
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 text-xs">
                                <ImageIcon size={28} className="mb-2 opacity-50" />
                                <span>Image preview will appear here</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-white">
                              {projectFormData.title || "Project Title"}
                            </h4>
                            <p className="text-xs text-neutral-400 line-clamp-3 mt-1 leading-relaxed">
                              {projectFormData.description || "Project description will appear here..."}
                            </p>
                          </div>

                          {projectFormData.techStack && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {projectFormData.techStack.split(',').map((tech, i) => tech.trim() ? (
                                <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  {tech.trim()}
                                </span>
                              ) : null)}
                            </div>
                          )}

                          {projectFormData.demoUrl && (
                            <div className="pt-2 text-xs text-emerald-400 flex items-center gap-1 truncate">
                              <ExternalLink size={12} />
                              <span className="truncate">{projectFormData.demoUrl}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* Standard Projects List View */
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                      <div>
                        <h3 className="text-base font-bold text-white">Live Portfolio Projects</h3>
                        <p className="text-xs text-neutral-400">
                          Add, update, or remove projects. Changes reflect on your portfolio immediately.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenAddProject}
                        className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20"
                      >
                        <Plus size={16} />
                        <span>Create New Project</span>
                      </button>
                    </div>

                    {projects.length === 0 ? (
                      <div className="py-12 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
                        <FolderGit2 size={36} className="mx-auto text-neutral-500 mb-3" />
                        <h4 className="text-sm font-semibold text-white mb-1">No Projects in Firestore Yet</h4>
                        <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
                          Default portfolio samples are currently displayed. Add your first custom project to start managing them!
                        </p>
                        <button
                          type="button"
                          onClick={handleOpenAddProject}
                          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all"
                        >
                          <Plus size={15} />
                          <span>Add First Project</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.map((project) => (
                          <div 
                            key={project.id}
                            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 flex flex-col justify-between transition-all group"
                          >
                            <div className="flex gap-4 items-start">
                              <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-800 shrink-0 border border-white/10">
                                <img
                                  src={project.imageUrl}
                                  alt={project.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400';
                                  }}
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-white truncate mb-1">
                                  {project.title}
                                </h4>
                                <p className="text-xs text-neutral-400 line-clamp-2 mb-2 leading-relaxed">
                                  {project.description}
                                </p>
                                {project.techStack && (
                                  <div className="flex flex-wrap gap-1">
                                    {project.techStack.split(',').slice(0, 3).map((tech, i) => (
                                      <span 
                                        key={i} 
                                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-emerald-400 border border-white/5"
                                      >
                                        {tech.trim()}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
                              {project.demoUrl ? (
                                <a
                                  href={project.demoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-emerald-400 transition-colors"
                                >
                                  <ExternalLink size={12} />
                                  <span className="truncate max-w-[150px]">Live Demo</span>
                                </a>
                              ) : (
                                <span className="text-[11px] text-neutral-600 font-mono">No demo link</span>
                              )}

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditProject(project)}
                                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                  <Edit3 size={13} className="text-emerald-400" />
                                  <span>Edit</span>
                                </button>

                                {deleteConfirmId === project.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        await onDeleteProject(project.id!);
                                        setDeleteConfirmId(null);
                                      }}
                                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="px-2 py-1 rounded-lg text-[11px] text-neutral-400 hover:text-white"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmId(project.id!)}
                                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                    title="Delete Project"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TAB 2: WEBSITE & PROFILE DETAILS (Simple, standard editor just like project modal) */}
            {activeTab === 'website' && (
              <form onSubmit={handleSaveWebsite} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-base font-bold text-white">Edit Website &amp; Profile Details</h3>
                    <p className="text-xs text-neutral-400">
                      Update your photo URL, hero bio, social channels, and core pillars with standard fields.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isResetConfirm ? (
                      <div className="flex items-center gap-1.5 p-1 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                        <span className="text-[11px] text-amber-300 font-medium px-1">Reset all?</span>
                        <button
                          type="button"
                          onClick={handleResetDefaults}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          Yes, Reset
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsResetConfirm(false)}
                          className="px-2 py-1 text-xs text-neutral-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsResetConfirm(true)}
                        className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-colors border border-white/5"
                      >
                        <RotateCcw size={13} />
                        <span>Reset Defaults</span>
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {isSavingSettings ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Save size={15} />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Sub-tab navigation for website sections */}
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <button
                    type="button"
                    onClick={() => setWebsiteSubTab('profile')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      websiteSubTab === 'profile'
                        ? 'bg-white/10 text-emerald-400 border border-emerald-500/30'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    1. Profile &amp; Bio
                  </button>
                  <button
                    type="button"
                    onClick={() => setWebsiteSubTab('contact')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      websiteSubTab === 'contact'
                        ? 'bg-white/10 text-emerald-400 border border-emerald-500/30'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    2. Contacts &amp; Socials
                  </button>
                  <button
                    type="button"
                    onClick={() => setWebsiteSubTab('pillars')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      websiteSubTab === 'pillars'
                        ? 'bg-white/10 text-emerald-400 border border-emerald-500/30'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    3. 3 Pillars &amp; Footer
                  </button>
                </div>

                {/* SECTION 1: PROFILE & BIO */}
                {websiteSubTab === 'profile' && (
                  <div className="space-y-4">
                    {/* Profile Picture Box */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <ImageIcon size={15} />
                          Profile Picture URL
                        </label>
                        {siteForm.avatarUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setSiteForm({ ...siteForm, avatarUrl: '' });
                              setImgError(false);
                            }}
                            className="text-[11px] text-neutral-400 hover:text-rose-400 transition-colors"
                          >
                            Use Default Portrait Photo
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-neutral-900 border-2 border-emerald-500/30 shrink-0 shadow-lg">
                          <img
                            src={activePhotoSrc}
                            alt="Profile Preview"
                            referrerPolicy="no-referrer"
                            onError={() => setImgError(true)}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>

                        <div className="flex-1 w-full space-y-2">
                          <input
                            type="url"
                            value={siteForm.avatarUrl}
                            onChange={(e) => {
                              setSiteForm({ ...siteForm, avatarUrl: e.target.value });
                              setImgError(false);
                            }}
                            placeholder="https://example.com/your-photo.jpg (Direct image link)"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/60 transition-colors font-mono text-xs"
                          />
                          <p className="text-[11px] text-neutral-400 leading-relaxed">
                            Paste any direct image link (PNG, JPG, WebP from GitHub, Imgur, or cloud storage). If blank or invalid, your default portrait photo is automatically displayed.
                          </p>
                          {imgError && (
                            <p className="text-[11px] text-amber-400 flex items-center gap-1.5">
                              <AlertCircle size={12} />
                              URL could not be loaded. Displaying default portrait photo.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Name & Highlighted Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={siteForm.fullName}
                          onChange={(e) => setSiteForm({ ...siteForm, fullName: e.target.value })}
                          placeholder="Shahriar Islam"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                          Highlighted Name / Nickname
                        </label>
                        <input
                          type="text"
                          required
                          value={siteForm.highlightName}
                          onChange={(e) => setSiteForm({ ...siteForm, highlightName: e.target.value })}
                          placeholder="Ratul"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-emerald-400 font-bold focus:outline-none focus:border-emerald-500/60"
                        />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Status / Role Badge (Top pill in Hero)
                      </label>
                      <input
                        type="text"
                        required
                        value={siteForm.statusBadge}
                        onChange={(e) => setSiteForm({ ...siteForm, statusBadge: e.target.value })}
                        placeholder="Independent Web Developer & Software Prototyper"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                      />
                    </div>

                    {/* Biography */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Biography / Story
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={siteForm.biography}
                        onChange={(e) => setSiteForm({ ...siteForm, biography: e.target.value })}
                        placeholder="Your story, vibe coding experience, and rapid prototyping journey..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60 leading-relaxed resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* SECTION 2: CONTACTS & SOCIALS */}
                {websiteSubTab === 'contact' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={siteForm.email}
                          onChange={(e) => setSiteForm({ ...siteForm, email: e.target.value })}
                          placeholder="shahriarislam275@gmail.com"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                          WhatsApp Display Number
                        </label>
                        <input
                          type="text"
                          required
                          value={siteForm.whatsappNumber}
                          onChange={(e) => setSiteForm({ ...siteForm, whatsappNumber: e.target.value })}
                          placeholder="+8801743904049"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                          WhatsApp Direct Digits (wa.me)
                        </label>
                        <input
                          type="text"
                          required
                          value={siteForm.whatsappRaw}
                          onChange={(e) => setSiteForm({ ...siteForm, whatsappRaw: e.target.value })}
                          placeholder="8801743904049"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60 font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                          Facebook Profile Link
                        </label>
                        <input
                          type="url"
                          value={siteForm.facebookUrl}
                          onChange={(e) => setSiteForm({ ...siteForm, facebookUrl: e.target.value })}
                          placeholder="https://www.facebook.com/shahriar.islam.ratul.00"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Instagram Profile Link
                      </label>
                      <input
                        type="url"
                        value={siteForm.instagramUrl}
                        onChange={(e) => setSiteForm({ ...siteForm, instagramUrl: e.target.value })}
                        placeholder="https://www.instagram.com/shahriar_islam_ratul/"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                        WhatsApp Pre-Filled Greeting Message
                      </label>
                      <textarea
                        rows={2}
                        value={siteForm.whatsappDefaultMsg}
                        onChange={(e) => setSiteForm({ ...siteForm, whatsappDefaultMsg: e.target.value })}
                        placeholder="Hi Shahriar! I saw your portfolio and would like to discuss a project with you."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                          Contact Section Heading
                        </label>
                        <input
                          type="text"
                          value={siteForm.contactHeading}
                          onChange={(e) => setSiteForm({ ...siteForm, contactHeading: e.target.value })}
                          placeholder="Get In Touch"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                          Contact Section Subtitle
                        </label>
                        <input
                          type="text"
                          value={siteForm.contactSubtitle}
                          onChange={(e) => setSiteForm({ ...siteForm, contactSubtitle: e.target.value })}
                          placeholder="Have an idea, need a rapid prototype, or want to collaborate? Reach out..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 3: 3 PILLARS & FOOTER */}
                {websiteSubTab === 'pillars' && (
                  <div className="space-y-4">
                    {/* Pillar 1 */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                      <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold">
                        Pillar 1 (Vibe Coding &amp; LLMs)
                      </span>
                      <input
                        type="text"
                        value={siteForm.pillar1Title}
                        onChange={(e) => setSiteForm({ ...siteForm, pillar1Title: e.target.value })}
                        placeholder="Pillar 1 Title"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/60 font-semibold"
                      />
                      <textarea
                        rows={2}
                        value={siteForm.pillar1Desc}
                        onChange={(e) => setSiteForm({ ...siteForm, pillar1Desc: e.target.value })}
                        placeholder="Pillar 1 Description"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500/60 resize-none"
                      />
                    </div>

                    {/* Pillar 2 */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                      <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold">
                        Pillar 2 (Rapid Prototyping)
                      </span>
                      <input
                        type="text"
                        value={siteForm.pillar2Title}
                        onChange={(e) => setSiteForm({ ...siteForm, pillar2Title: e.target.value })}
                        placeholder="Pillar 2 Title"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/60 font-semibold"
                      />
                      <textarea
                        rows={2}
                        value={siteForm.pillar2Desc}
                        onChange={(e) => setSiteForm({ ...siteForm, pillar2Desc: e.target.value })}
                        placeholder="Pillar 2 Description"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500/60 resize-none"
                      />
                    </div>

                    {/* Pillar 3 */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                      <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold">
                        Pillar 3 (Thought &amp; Web Dev)
                      </span>
                      <input
                        type="text"
                        value={siteForm.pillar3Title}
                        onChange={(e) => setSiteForm({ ...siteForm, pillar3Title: e.target.value })}
                        placeholder="Pillar 3 Title"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/60 font-semibold"
                      />
                      <textarea
                        rows={2}
                        value={siteForm.pillar3Desc}
                        onChange={(e) => setSiteForm({ ...siteForm, pillar3Desc: e.target.value })}
                        placeholder="Pillar 3 Description"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500/60 resize-none"
                      />
                    </div>

                    {/* Footer text */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Footer Copyright / Tagline
                      </label>
                      <input
                        type="text"
                        value={siteForm.footerText}
                        onChange={(e) => setSiteForm({ ...siteForm, footerText: e.target.value })}
                        placeholder="Shahriar Islam Ratul. Built with passion & Vibe coding."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                      />
                    </div>
                  </div>
                )}

                {/* Form Action Buttons */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-neutral-300 hover:text-white text-xs sm:text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-xs sm:text-sm disabled:opacity-50"
                  >
                    {isSavingSettings ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save All Website Details</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: OVERVIEW & STATS */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        Live Projects
                      </span>
                      <FolderGit2 size={18} className="text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold font-display text-white">
                      {projects.length}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Stored in Cloud Firestore
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        Database Status
                      </span>
                      <Database size={18} className="text-emerald-400" />
                    </div>
                    <div className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Connected
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Real-time synchronized
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        Admin Role
                      </span>
                      <ShieldCheck size={18} className="text-emerald-400" />
                    </div>
                    <div className="text-lg font-bold text-white">
                      Super Admin
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Full read/write permissions
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                  <h4 className="text-sm font-bold text-white">Quick Administration Links</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('projects')}
                      className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                          Manage Projects
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          Add new prototypes, update screenshots, or edit descriptions
                        </div>
                      </div>
                      <FolderGit2 size={18} className="text-neutral-500 group-hover:text-emerald-400 transition-colors shrink-0 ml-2" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('website')}
                      className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                          Edit Profile &amp; Bio
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          Change photo URL, story text, WhatsApp number, and contacts
                        </div>
                      </div>
                      <Globe size={18} className="text-neutral-500 group-hover:text-emerald-400 transition-colors shrink-0 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
