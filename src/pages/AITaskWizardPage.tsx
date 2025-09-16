import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useProjects } from '@/contexts/ProjectsContext';
import { useTasks } from '@/contexts/TasksContext';
import { generateTasksFromProject, generateRecurringTasks, estimateProjectDuration } from '@/utils/taskGenerator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Bot,
  Send,
  Calendar,
  DollarSign,
  Clock,
  ListChecks,
  ArrowLeft,
  Sparkles,
  ChevronRight,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

type Message = { role: 'assistant' | 'user'; text: string; meta?: any };

type Answers = {
  projectName?: string;
  projectType?: 'residential' | 'commercial' | 'renovation' | 'industrial' | 'institutional' | 'other';
  description?: string;
  startDate?: string; // yyyy-MM-dd
  endDate?: string; // yyyy-MM-dd
  budget?: number;
  constraints?: string[]; // e.g., ['permits','access','weather']
  topPriority?: 'time' | 'cost' | 'quality' | 'safety' | 'scope';
  teamSize?: number;
  risksText?: string;
  doneTasks?: string[]; // user-specified done tasks
};

const QUICK_TYPES = ['residential', 'commercial', 'renovation', 'industrial', 'institutional'] as const;

// Simple, rule-based next-question engine
function getNextQuestion(a: Answers): { id: string; prompt: string; options?: string[] } | null {
  if (!a.projectName) return { id: 'projectName', prompt: "What's the project name?" };
  if (!a.projectType) return { id: 'projectType', prompt: 'What type of project is this?', options: [...QUICK_TYPES, 'other'] };
  if (!a.description) return { id: 'description', prompt: 'Give a brief scope/description.' };
  if (!a.startDate) return { id: 'startDate', prompt: 'When does the project start? (yyyy-mm-dd)' };
  if (!a.endDate) return { id: 'endDate', prompt: 'When should it finish? (yyyy-mm-dd)' };
  if (a.budget === undefined) return { id: 'budget', prompt: 'Approximate total budget (USD)?' };
  if (!a.topPriority) return { id: 'topPriority', prompt: 'Pick the top priority.', options: ['time','cost','quality','safety','scope'] };
  if (!a.teamSize) return { id: 'teamSize', prompt: 'Estimated team size working concurrently?' };
  if (!a.constraints || a.constraints.length === 0) return { id: 'constraints', prompt: 'Any constraints? Choose any that apply.', options: ['permits','weather','site access','noise hours','supply chain','none'] };
  if (!a.risksText) return { id: 'risksText', prompt: 'Any known risks or special considerations?' };
  if (!a.doneTasks || a.doneTasks.length === 0) return { id: 'doneTasks', prompt: 'Anything already done (e.g., survey, permits, demo)? List comma‑separated or say none.' };
  return null;
}

function parseDateLike(v: string): string | undefined {
  const d = v.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  // Attempt loose parsing
  const dt = new Date(d);
  if (!isNaN(dt.getTime())) return dt.toISOString().split('T')[0];
  return undefined;
}

const AITaskWizardPage: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const { getProject } = useProjects();
  const { addTask } = useTasks();
  const { toast } = useToast();

  const project = projectId ? getProject(projectId) : undefined;

  const [answers, setAnswers] = useState<Answers>(() => ({
    projectName: project?.name || search.get('name') || undefined,
    projectType: (project?.projectType as any) || undefined,
    description: project?.description || search.get('desc') || undefined,
    startDate: project?.startDate || undefined,
    endDate: project?.endDate || undefined,
  }));
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [previewTasks, setPreviewTasks] = useState<any[]>([]);
  const [includeMap, setIncludeMap] = useState<Record<string, boolean>>({});

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Seed assistant greeting and first question
  useEffect(() => {
    const greet: Message = { role: 'assistant', text: `Hi! I’ll help craft a prioritized task plan for ${answers.projectName || 'your project'}. I’ll ask quick questions and adapt as we go.` };
    setMessages((m) => (m.length === 0 ? [greet] : m));
  }, []);

  const nextQ = useMemo(() => getNextQuestion(answers), [answers]);

  useEffect(() => {
    if (nextQ) {
      setMessages((prev) => [...prev, { role: 'assistant', text: nextQ.prompt, meta: { options: nextQ.options, id: nextQ.id } }]);
      setSelectedOptions([]);
    } else {
      // All inputs collected -> generate preview
      try {
        const base = generateTasksFromProject(
          projectId || 'new',
          answers.projectName || 'New Project',
          answers.description || '',
          answers.projectType,
          answers.startDate
        );

        const rec = (answers.startDate && answers.endDate)
          ? generateRecurringTasks(
              projectId || 'new',
              answers.startDate,
              answers.endDate,
              ['Pre-Construction','Construction','Post-Construction']
            )
          : [];

        // Mark tasks as done based on user input
        const loweredDone = (answers.doneTasks || []).map((t) => t.toLowerCase());
        const merged = [...base, ...rec].map((t, idx) => ({
          ...t,
          // If user said something is already done, mark complete and reduce priority
          completion_percentage: loweredDone.some((d) => t.title.toLowerCase().includes(d)) ? 100 : 0,
          priority: ((): any => {
            const p = t.priority;
            if (loweredDone.some((d) => t.title.toLowerCase().includes(d))) return 'low';
            // Emphasize per topPriority
            switch (answers.topPriority) {
              case 'time':
                return p === 'medium' ? 'high' : p;
              case 'cost':
                return p; // keep
              case 'quality':
              case 'safety':
                return p === 'medium' ? 'high' : p;
              default:
                return p;
            }
          })(),
          _rank: idx,
        }));

        // Sort: incomplete first, then by priority, then by dependency count, then by soonest due
        const prRank: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 } as any;
        merged.sort((a, b) => {
          const compA = a.completion_percentage === 100 ? 1 : 0;
          const compB = b.completion_percentage === 100 ? 1 : 0;
          if (compA !== compB) return compA - compB;
          const pr = (prRank[a.priority] ?? 9) - (prRank[b.priority] ?? 9);
          if (pr !== 0) return pr;
          const dep = (b.dependencies?.length || 0) - (a.dependencies?.length || 0);
          if (dep !== 0) return dep;
          const ad = (a.due_date || '').localeCompare(b.due_date || '');
          if (ad !== 0) return ad;
          return a._rank - b._rank;
        });

        setPreviewTasks(merged);
        setIncludeMap(Object.fromEntries(merged.map((t) => [t.title, t.completion_percentage !== 100])));
        const weeks = estimateProjectDuration(merged);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: `Here’s a prioritized plan. I estimated ~${weeks} weeks of effort across all tasks. Review and confirm which to create.` },
        ]);
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: 'I had trouble generating tasks. Please adjust inputs and try again.' },
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextQ]);

  const handleSubmit = () => {
    const q = nextQ;
    if (!q) return;

    const userText = input.trim();
    if (!userText && selectedOptions.length === 0) return;

    // Append user message
    setMessages((prev) => [...prev, { role: 'user', text: userText || selectedOptions.join(', ') }]);

    // Apply answer
    setAnswers((prev) => {
      const next = { ...prev } as Answers;
      switch (q.id) {
        case 'projectName':
          next.projectName = userText;
          break;
        case 'projectType':
          next.projectType = (selectedOptions[0] || userText) as any;
          break;
        case 'description':
          next.description = userText;
          break;
        case 'startDate': {
          const d = parseDateLike(userText);
          if (!d) {
            setMessages((prev) => [...prev, { role: 'assistant', text: 'Please use a valid date like 2025-03-15.' }]);
            return prev;
          }
          next.startDate = d;
          break;
        }
        case 'endDate': {
          const d = parseDateLike(userText);
          if (!d) {
            setMessages((prev) => [...prev, { role: 'assistant', text: 'Please use a valid date like 2025-11-30.' }]);
            return prev;
          }
          next.endDate = d;
          break;
        }
        case 'budget': {
          const n = Number(userText.replace(/[$,\s]/g, ''));
          if (!isFinite(n) || n <= 0) {
            setMessages((prev) => [...prev, { role: 'assistant', text: 'Please enter a positive number for budget.' }]);
            return prev;
          }
          next.budget = Math.round(n);
          break;
        }
        case 'topPriority':
          next.topPriority = (selectedOptions[0] || userText) as any;
          break;
        case 'teamSize': {
          const n = Number(userText.replace(/[^0-9]/g, ''));
          if (!isFinite(n) || n <= 0) {
            setMessages((prev) => [...prev, { role: 'assistant', text: 'Please enter an estimated team size (e.g., 5).' }]);
            return prev;
          }
          next.teamSize = Math.round(n);
          break;
        }
        case 'constraints': {
          const list = selectedOptions.length ? selectedOptions : userText.split(',').map((s) => s.trim()).filter(Boolean);
          next.constraints = list.filter((v, i, arr) => arr.indexOf(v) === i);
          break;
        }
        case 'risksText':
          next.risksText = userText;
          break;
        case 'doneTasks': {
          const list = userText.toLowerCase() === 'none' ? [] : userText.split(',').map((s) => s.trim()).filter(Boolean);
          next.doneTasks = list;
          break;
        }
      }
      return next;
    });

    setInput('');
    setSelectedOptions([]);
  };

  const handleCreateTasks = async () => {
    if (!projectId) {
      toast({ title: 'Project required', description: 'Create/select a project first.', variant: 'destructive' as any });
      return;
    }
    const toCreate = previewTasks.filter((t) => includeMap[t.title]);
    let created = 0;
    for (const t of toCreate) {
      addTask({
        ...t,
        projectId,
      });
      created += 1;
    }
    toast({ title: 'Tasks created', description: `Added ${created} tasks to the project.` });
    navigate(`/project/${projectId}/dashboard`);
  };

  const renderOptions = (opts: string[]) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {opts.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => setSelectedOptions((prev) => (prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]))}
          className={`px-3 py-1 rounded-full text-sm border ${selectedOptions.includes(o) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
        >
          {o}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Badge variant="outline">AI Task Wizard</Badge>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              {answers.projectName || project?.name || 'New Project'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {answers.startDate || 'Start: TBA'} → {answers.endDate || 'End: TBA'}</div>
              <div className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> {answers.budget ? `$${answers.budget.toLocaleString()}` : 'Budget: TBA'}</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Priority: {answers.topPriority || 'TBA'}</div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bot className="w-5 h-5 text-blue-600" /> Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[420px] overflow-y-auto space-y-4 pr-2">
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm shadow ${m.role === 'assistant' ? 'bg-white border border-gray-200 text-gray-800' : 'bg-blue-600 text-white'}`}>
                      <div className="whitespace-pre-wrap">{m.text}</div>
                      {m.meta?.options && renderOptions(m.meta.options)}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="mt-4 flex gap-2">
                {nextQ?.id === 'description' || nextQ?.id === 'risksText' || nextQ?.id === 'doneTasks' ? (
                  <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your answer..." className="flex-1" />
                ) : (
                  <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your answer or pick an option..." className="flex-1" />
                )}
                <Button onClick={handleSubmit} disabled={!nextQ}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ListChecks className="w-5 h-5 text-green-600" /> Suggested Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {previewTasks.length === 0 ? (
                <div className="text-sm text-gray-500">Answer the questions to see a tailored task plan.</div>
              ) : (
                <div className="space-y-3">
                  {previewTasks.map((t) => (
                    <div key={t.title} className={`border rounded-lg p-3 ${t.completion_percentage === 100 ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {t.completion_percentage === 100 ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : null}
                            {t.title}
                          </div>
                          <div className="text-xs text-gray-600 mt-1 line-clamp-2">{t.description}</div>
                          <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">
                            <Badge variant="outline">Priority: {t.priority}</Badge>
                            {t.phase_name ? <Badge variant="outline">{t.phase_name}</Badge> : null}
                            {t.start_date ? <Badge variant="outline">Start {t.start_date}</Badge> : null}
                            {t.due_date ? <Badge variant="outline">Due {t.due_date}</Badge> : null}
                            <Badge variant="outline">LOE {t.loe?.most_likely_hours ?? t.estimated_hours}h</Badge>
                            {t.dependencies?.length ? <Badge variant="outline">Deps {t.dependencies.length}</Badge> : null}
                            {t.weather_dependent ? <Badge variant="outline">Weather</Badge> : null}
                            {t.requires_inspection ? <Badge variant="outline">Inspection</Badge> : null}
                          </div>
                        </div>
                        <div className="pl-2">
                          <label className="inline-flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={!!includeMap[t.title]}
                              onChange={(e) => setIncludeMap((prev) => ({ ...prev, [t.title]: e.target.checked }))}
                              disabled={t.completion_percentage === 100}
                            />
                            Include
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      You can deselect tasks you don’t need.
                    </div>
                    <Button onClick={handleCreateTasks} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                      Create Selected Tasks <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AITaskWizardPage;
