/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Loader2, Check, X, Dumbbell, Utensils, Scale, Activity, Camera, Image as ImageIcon } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { UserProfile, ChatMessage, FitnessState, Meal } from '../types';
import { generateWorkoutPlan, getWorkoutForDay } from '../utils/fitness';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface PendingAction {
  id: string;
  type: 'add_meal' | 'update_workout_settings' | 'log_weight' | 'toggle_exercise' | 'update_day_workout';
  args: any;
  description: string;
}

interface ChatAssistantProps {
  profile: UserProfile;
  state: FitnessState;
  dispatch: {
    addMeal: (meal: Omit<Meal, 'id' | 'timestamp'>) => void;
    deleteMeal: (id: string) => void;
    updateMeal: (meal: Meal) => void;
    logWeight: (weight: number) => void;
    toggleExercise: (exerciseName: string) => void;
    updateChatHistory: (messages: ChatMessage[]) => void;
    logout: () => void;
    updateProfile: (profile: UserProfile) => void;
  };
}

export default function ChatAssistant({ profile, state, dispatch }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (state.chatHistory && state.chatHistory.length > 0) {
      return state.chatHistory;
    }
    return [
      { text: `Olá ${profile.name.split(' ')[0]}! Sou o seu consultor técnico Kamba Fit. Analisei o seu perfil de ${profile.goal === 'mass' ? 'hipertrofia' : 'definição'} e estou pronto para otimizar o seu treino. Em que posso ajudar?`, isBot: true }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const lastMessageCount = useRef(messages.length);
  const isAutoScrolling = useRef(false);

  // Initialize scroll to bottom on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      const hasNewMessage = messages.length > lastMessageCount.current;
      const lastMessageIsUser = messages.length > 0 && !messages[messages.length - 1].isBot;

      if (hasNewMessage && (isAtBottom || lastMessageIsUser)) {
        isAutoScrolling.current = true;
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        // Reset auto-scrolling flag after animation likely finished
        setTimeout(() => { isAutoScrolling.current = false; }, 500);
      }
    }
    lastMessageCount.current = messages.length;
    dispatch.updateChatHistory(messages);
  }, [messages, dispatch]);

  // Handle pending action scroll separately if needed
  useEffect(() => {
    if (pendingAction && scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [pendingAction]);

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setSelectedImage(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const executeAction = (action: PendingAction) => {
    switch (action.type) {
      case 'add_meal':
        dispatch.addMeal(action.args);
        setMessages(prev => [...prev, { text: `✅ Refeição "${action.args.name}" adicionada com sucesso!`, isBot: true }]);
        break;
      case 'update_workout_settings':
        dispatch.updateProfile({ ...profile, ...action.args });
        setMessages(prev => [...prev, { text: `✅ Plano de treino atualizado! Agora estás focado em ${action.args.goal === 'mass' ? 'Ganho de Massa' : 'Perda de Peso'}.`, isBot: true }]);
        break;
      case 'log_weight':
        dispatch.logWeight(action.args.weight);
        setMessages(prev => [...prev, { text: `✅ Peso de ${action.args.weight}kg registado no teu histórico.`, isBot: true }]);
        break;
      case 'toggle_exercise':
        dispatch.toggleExercise(action.args.exerciseName);
        setMessages(prev => [...prev, { text: `✅ O teu progresso no exercício "${action.args.exerciseName}" foi atualizado.`, isBot: true }]);
        break;
      case 'update_day_workout':
        const overrides = profile.workoutOverrides || {};
        const newWorkout = {
          id: Math.random().toString(),
          label: action.args.label,
          exercises: action.args.exercises
        };
        dispatch.updateProfile({ 
          ...profile, 
          workoutOverrides: { ...overrides, [action.args.dayIndex]: newWorkout } 
        });
        const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
        setMessages(prev => [...prev, { text: `✅ Plano de ${days[action.args.dayIndex]} atualizado para: **${action.args.label}**!`, isBot: true }]);
        break;
    }
    setPendingAction(null);
  };

  const handleSend = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userText = input.trim();
    const userImage = selectedImage;
    
    setInput('');
    setSelectedImage(null);
    setMessages(prev => [...prev, { text: userText || "Analisa esta imagem do meu prato.", isBot: false, image: userImage || undefined }]);
    setIsLoading(true);

    try {
      const history: { role: "user" | "model", parts: { text: string }[] }[] = [];
      
      messages.forEach((m, idx) => {
        if (idx === 0 && m.isBot) return;
        const role = m.isBot ? "model" : "user";
        if (history.length > 0 && history[history.length - 1].role === role) {
          history[history.length - 1].parts[0].text += "\n" + m.text;
        } else {
          history.push({ role, parts: [{ text: m.text }] });
        }
      });

      if (history.length > 0 && history[0].role === "model") {
        history.shift();
      }

      const daysOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
      const trainingDaysNames = profile.trainingDays.map(d => daysOfWeek[d]).join(', ');
      
      const basePlan = generateWorkoutPlan(profile);
      const fullPlanSummary = profile.trainingDays.map(d => {
        const workout = getWorkoutForDay(profile, basePlan, d);
        if (!workout) return `${daysOfWeek[d]}: Descanso`;
        return `${daysOfWeek[d]}: ${workout.label} (${workout.exercises.length} exercícios)`;
      }).join('; ');

      // Prepare parts for the current message
      const currentParts: any[] = [{ text: userText || "Analisa esta imagem do meu prato." }];
      if (userImage) {
        currentParts.push({
          inlineData: {
            data: userImage.split(',')[1],
            mimeType: 'image/jpeg'
          }
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...history, { role: "user", parts: currentParts }],
        config: {
          systemInstruction: `És o assistente técnico de elite do Kamba Fit (Angola). Estás agora no comando total do projeto.
          DADOS DO UTILIZADOR: Nome: ${profile.name}, Objetivo: ${profile.goal === 'mass' ? 'Ganho de Massa' : 'Perda de Peso'}, Peso: ${profile.weight}kg, Altura: ${profile.height}m, Treina ${profile.daysPerWeek} dias/semana.
          DIAS DE TREINO DEFINIDOS: ${trainingDaysNames}.
          LOCAL DE TREINO: ${profile.hasGymAccess ? 'Ginásio' : 'Casa'}.
          PLANO ATUAL: ${fullPlanSummary}.
          
          DIRETRIZES:
          1. PODER DE AÇÃO: Podes gerir o APP usando ferramentas. Sempre que o utilizador quiser registar algo ou alterar o plano, usa a ferramenta correspondente.
          2. ANÁLISE DE ALIMENTOS POR FOTO: Quando o utilizador enviar uma foto de comida, identifica os alimentos presentes. É OBRIGATÓRIO perguntar as quantidades aproximadas (em gramas, porções ou unidades) antes de sugerir os macros ou usar a ferramenta de registo (add_meal). Nunca faças cálculos sem antes ter as quantidades confirmadas pelo utilizador.
          3. ESTILO E TOM: EXTREMAMENTE PROFISSIONAL, FORMAL E TÉCNICO. É RIGOROSAMENTE PROIBIDO o uso de gírias, calão ou linguagem informal angolana ou de qualquer outro tipo (ex: não utilizes "mambo", "bro", "pessoal", "bora", etc). Mantém um registo formal, educado e focado em dados científicos de saúde e fitness.
          
          FERRAMENTAS DISPONÍVEIS:
          - add_meal: Nome, calorias, proteína, hidratos, gordura.
          - update_workout_settings: Mudar objetivo, dias de treino, acesso a ginásio.
          - log_weight: Registar novo peso.
          - toggle_exercise: Marcar exercício como concluído.
          - update_day_workout: Altera o conteúdo de um dia específico.`,
          tools: [
            {
              functionDeclarations: [
                {
                  name: "add_meal",
                  description: "Adiciona uma refeição ao diário de hoje.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "Nome da refeição" },
                      calories: { type: Type.NUMBER, description: "Calorias em kcal" },
                      protein: { type: Type.NUMBER, description: "Proteína em g" },
                      carbs: { type: Type.NUMBER, description: "Hidratos em g" },
                      fat: { type: Type.NUMBER, description: "Gordura em g" },
                    },
                    required: ["name", "calories", "protein", "carbs", "fat"],
                  },
                },
                {
                  name: "update_workout_settings",
                  description: "Altera o plano de treino semanal.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      goal: { type: Type.STRING, description: "mass para hipertrofia, loss para definição" },
                      daysPerWeek: { type: Type.NUMBER, description: "Dias de treino por semana" },
                      hasGymAccess: { type: Type.BOOLEAN, description: "Se tem acesso ao ginásio" },
                    },
                    required: ["goal", "daysPerWeek", "hasGymAccess"],
                  },
                },
                {
                  name: "log_weight",
                  description: "Regista o peso atual.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      weight: { type: Type.NUMBER, description: "Peso em kg" },
                    },
                    required: ["weight"],
                  },
                },
                {
                  name: "toggle_exercise",
                  description: "Marca exercício como feito.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      exerciseName: { type: Type.STRING, description: "Nome exato do exercício" },
                    },
                    required: ["exerciseName"],
                  },
                },
                {
                  name: "update_day_workout",
                  description: "Altera o plano de um dia específico (ex: segunda para pernas).",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      dayIndex: { type: Type.NUMBER, description: "0 para Domingo, 1 para Segunda, 2 Terça, 3 Quarta, 4 Quinta, 5 Sexta, 6 Sábado." },
                      label: { type: Type.STRING, description: "Nome do treino (ex: Peito e Tríceps)" },
                      exercises: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            sets: { type: Type.NUMBER },
                            reps: { type: Type.STRING }
                          },
                          required: ["name", "sets", "reps"]
                        }
                      }
                    },
                    required: ["dayIndex", "label", "exercises"],
                  },
                }
              ],
            },
          ],
        },
      });

      const functionCalls = response.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        const { name, args } = call;
        const functionArgs = args as any;
        let description = "";
        let type: PendingAction['type'] = 'add_meal';

        if (name === 'add_meal') {
          type = 'add_meal';
          description = `Adicionar ${functionArgs.name} (${functionArgs.calories}kcal)`;
        } else if (name === 'update_workout_settings') {
          type = 'update_workout_settings';
          description = `Mudar plano para ${functionArgs.goal === 'mass' ? 'Hipertrofia' : 'Definição'}`;
        } else if (name === 'log_weight') {
          type = 'log_weight';
          description = `Registar peso: ${functionArgs.weight}kg`;
        } else if (name === 'toggle_exercise') {
          type = 'toggle_exercise';
          description = `Marcar "${functionArgs.exerciseName}" como concluído`;
        } else if (name === 'update_day_workout') {
          type = 'update_day_workout';
          const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
          description = `Mudar ${days[functionArgs.dayIndex]} para ${functionArgs.label}`;
        }

        setPendingAction({ id: Math.random().toString(), type, args: functionArgs, description });
        setMessages(prev => [...prev, { text: "Entendi. Queres que eu faça essa alteração no teu plano?", isBot: true }]);
      } else {
        setMessages(prev => [...prev, { text: response.text || "Sem resposta.", isBot: true }]);
      }
    } catch (error) {
      console.error("Chat AI Error:", error);
      setMessages(prev => [...prev, { text: "Erro ao processar. Tente novamente.", isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dark-card h-full flex flex-col border-border-subtle shadow-2xl overflow-hidden !p-0">
      <div className="p-4 border-b border-border-subtle flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center text-black shadow-lg">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-text-main">Assistente Kamba</h2>
            <p className="text-[10px] text-accent font-bold uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={8} /> Inteligência Ativa
            </p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 md:p-6 space-y-6 custom-scrollbar bg-surface/50">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex w-full ${m.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
              m.isBot 
                ? 'bg-surface border border-border-subtle text-text-main rounded-tl-none' 
                : 'gold-gradient text-black font-semibold rounded-tr-none'
            }`}>
              {m.image && (
                <div className="mb-2 rounded-lg overflow-hidden border border-black/10">
                  <img src={m.image} alt="Meal" className="w-full h-auto max-h-48 object-cover" />
                </div>
              )}
              <div className={`prose prose-sm max-w-none prose-p:leading-tight prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0 prose-strong:text-accent ${m.isBot ? 'prose-text-main dark:prose-invert' : 'prose-black'}`}>
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {pendingAction && (
          <div className="flex justify-start">
            <div className="bg-accent/10 border border-accent/20 p-4 rounded-2xl w-full max-w-xs shadow-xl animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-accent text-black flex items-center justify-center">
                  {pendingAction.type === 'add_meal' && <Utensils size={14} />}
                  {pendingAction.type === 'update_workout_settings' && <Dumbbell size={14} />}
                  {pendingAction.type === 'log_weight' && <Scale size={14} />}
                  {pendingAction.type === 'toggle_exercise' && <Activity size={14} />}
                </div>
                <p className="text-xs font-black uppercase text-accent">{pendingAction.description}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => executeAction(pendingAction)}
                  className="flex-1 gold-gradient text-black py-2 rounded-xl text-[10px] font-black uppercase shadow-lg"
                >
                  Confirmar
                </button>
                <button 
                  onClick={() => setPendingAction(null)}
                  className="px-4 bg-surface border border-border-subtle text-text-main py-2 rounded-xl text-[10px] font-black uppercase hover:bg-surface-hover"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-surface border border-border-subtle p-4 rounded-2xl animate-pulse">
              <Loader2 className="animate-spin text-accent" size={20} />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border-subtle bg-background/80 backdrop-blur-md shrink-0">
        {selectedImage && (
          <div className="mb-3 relative inline-block">
            <img src={selectedImage} alt="Preview" className="w-20 h-20 object-cover rounded-xl border-2 border-accent" />
            <button 
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
            >
              <X size={12} />
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input 
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageSelect}
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-14 bg-surface border border-border-subtle rounded-2xl flex items-center justify-center hover:bg-surface-hover transition-all text-text-muted hover:text-accent group shrink-0"
          >
            <Camera size={20} className="group-hover:scale-110 transition-transform" />
          </button>
          <div className="relative flex-1">
            <input 
              value={input}
              disabled={isLoading || !!pendingAction}
              autoComplete="off"
              placeholder={pendingAction ? "Confirma a ação acima..." : "Diga algo..."}
              className="w-full bg-surface border border-border-subtle rounded-2xl pl-5 pr-14 py-4 outline-none focus:border-accent focus:bg-surface-hover transition-all text-sm font-bold text-text-main placeholder:text-text-muted/30"
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={(!input.trim() && !selectedImage) || isLoading || !!pendingAction}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent text-black p-2.5 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all shadow-xl flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
