import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/Home.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const options = {
  experience: [
    {
      id: "beginner",
      label: "Principiante",
      description: "Nunca he entrenado o llevo menos de 3 meses.",
    },
    {
      id: "intermediate",
      label: "Intermedio",
      description: "Conozco los ejercicios básicos y llevo entre 3 y 12 meses.",
    },
  ],
  limitation: [
    {
      id: "none",
      label: "Ninguna",
      description: "Puedo realizar cualquier tipo de movimiento.",
    },
    {
      id: "upper_body",
      label: "Tren superior",
      description: "Evitar sobrecargas empujando hacia arriba.",
    },
    {
      id: "lower_body",
      label: "Tren inferior",
      description: "Evitar impactos severos o sentadillas profundas.",
    },
  ],
  goal: [
    {
      id: "hypertrophy",
      label: "Hipertrofia",
      description: "Ganar masa muscular y fuerza.",
    },
    {
      id: "recomposition",
      label: "Recomposición",
      description: "Reducir grasa manteniendo músculo.",
    },
    {
      id: "conditioning",
      label: "Acondicionamiento",
      description: "Mejorar resistencia y salud general.",
    },
  ],
  days: [
    {
      id: "3",
      label: "3 días",
      description: "Ideal para rutinas de cuerpo completo.",
    },
    {
      id: "4",
      label: "4 días",
      description: "Ideal para divisiones torso/pierna.",
    },
    {
      id: "5",
      label: "5 días",
      description: "Ideal para empuje, jalón y pierna.",
    },
  ],
};

const steps = [
  {
    key: "experience",
    title: "Experiencia",
    question: "¿Cuál es tu nivel de experiencia actual?",
  },
  {
    key: "limitation",
    title: "Condición física",
    question: "¿Tienes alguna limitación o dolor articular?",
  },
  {
    key: "goal",
    title: "Objetivo",
    question: "¿Cuál es tu objetivo para los próximos 3 meses?",
  },
  {
    key: "days",
    title: "Disponibilidad",
    question: "¿Cuántos días puedes entrenar por semana?",
  },
];

const defaultAnswers = {
  experience: "beginner",
  limitation: "none",
  goal: "hypertrophy",
  days: "3",
};

const fallbackPlan = {
  title: "Rutina inicial segura",
  routineType: "fallback_safe",
  confidence: null,
  model: "fallback_rules",
  predictionSource: "fallback_rules",
  trainedWithCoachApprovedCases: 0,
  summary:
    "Comienza con cargas controladas, técnica estable y descanso de 60 a 90 segundos. Si aparece dolor articular, detén el ejercicio y consulta a un coach.",
  split: ["Día 1: Fullbody técnico", "Día 2: Fullbody fuerza base", "Día 3: Fullbody metabólico"],
  recommendations: [
    "Calienta 8 minutos antes de levantar peso.",
    "Usa una intensidad moderada: termina cada serie con 2 repeticiones en reserva.",
    "Registra pesos y repeticiones para progresar cada semana.",
  ],
};

const routineQuestions = [
  { id: "why", label: "Por qué esta rutina" },
  { id: "warmup", label: "Cómo calentar" },
  { id: "progress", label: "Cómo progresar" },
  { id: "pain", label: "Si siento dolor" },
];

export default function UserDashboard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(defaultAnswers);
  const [plan, setPlan] = useState(null);
  const [routineAnswer, setRoutineAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(null);
  const [apiStatus, setApiStatus] = useState("idle");
  const [modelHealth, setModelHealth] = useState({
    status: "checking",
    message: "Revisando conexión con Python...",
  });

  const selectedStep = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const selectedLabels = useMemo(
    () =>
      Object.entries(answers).map(([key, value]) => ({
        key,
        label: options[key].find((option) => option.id === value)?.label,
      })),
    [answers]
  );

  const selectAnswer = (key, value) => {
    setAnswers((current) => ({ ...current, [key]: value }));
  };

  const checkModelHealth = async () => {
    setModelHealth({
      status: "checking",
      message: "Revisando conexión con Python...",
    });

    try {
      const response = await fetch(`${API_URL}/ai/model-health`);
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.detail || data.error || "Modelo no disponible");
      }

      setModelHealth({
        status: "ready",
        message: `Python conectado: ${data.model} (${data.trainedWithCoachApprovedCases} casos coach)`,
      });
    } catch (error) {
      setModelHealth({
        status: "offline",
        message: "Backend activo sin Python: se usará rutina de respaldo hasta configurar PYTHON_BIN.",
      });
    }
  };

  useEffect(() => {
    checkModelHealth();
  }, []);

  const generatePlan = async () => {
    setIsLoading(true);
    setApiStatus("idle");

    try {
      const response = await fetch(`${API_URL}/ai/workout-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      if (!response.ok) {
        throw new Error("La API no pudo generar el plan.");
      }

      const data = await response.json();
      setPlan(data.plan);
      setRoutineAnswer(null);
      setApiStatus(data.mlStatus === "python_model" ? "model" : "fallback");
    } catch (error) {
      setPlan(fallbackPlan);
      setRoutineAnswer(null);
      setApiStatus("fallback");
    } finally {
      setIsLoading(false);
    }
  };

  const askRoutineQuestion = async (questionType) => {
    setQuestionLoading(questionType);

    try {
      const response = await fetch(`${API_URL}/ai/routine-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...answers, questionType }),
      });

      if (!response.ok) {
        throw new Error("La API no pudo responder la pregunta.");
      }

      const data = await response.json();
      setRoutineAnswer(data.response);
      setApiStatus("model");
    } catch (error) {
      setRoutineAnswer({
        question: "Respuesta de apoyo",
        answer:
          "Mantén la técnica limpia, evita entrenar con dolor y pide a un coach que valide cualquier ajuste importante.",
        safety: { freeTextAccepted: false, questionWhitelistValidated: true },
      });
      setApiStatus("fallback");
    } finally {
      setQuestionLoading(null);
    }
  };

  return (
    <>
      <Head>
        <title>GymSAAS | Usuario</title>
        <meta
          name="description"
          content="Dashboard de usuario con asistente parametrizado para gimnasio."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.page}>
        <aside className={styles.sidebar} aria-label="Resumen del usuario">
          <div>
            <p className={styles.eyebrow}>GymSAAS</p>
            <h1>Hola, Ricardo</h1>
            <p className={styles.muted}>Plan activo y acceso habilitado</p>
          </div>

          <nav className={styles.nav} aria-label="Navegación principal">
            <a className={styles.active} href="#dashboard">Inicio</a>
            <a href="#assistant">Asistente</a>
            <a href="#routine">Rutina</a>
          </nav>
        </aside>

        <section className={styles.content} id="dashboard">
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Dashboard de usuario</p>
              <h2>Tu entrenamiento de hoy</h2>
            </div>
            <span className={styles.status}>Membresía pagada</span>
          </header>

          <section className={styles.metricsGrid} aria-label="Métricas del usuario">
            <article className={styles.metric}>
              <span>Próxima visita</span>
              <strong>Hoy 7:30 PM</strong>
              <p>Torso ligero y movilidad</p>
            </article>
            <article className={styles.metric}>
              <span>Racha semanal</span>
              <strong>3 / 4</strong>
              <p>Vas arriba del promedio</p>
            </article>
            <article className={styles.metric}>
              <span>Afluencia actual</span>
              <strong>Moderada</strong>
              <p>45 personas en sala</p>
            </article>
          </section>

          <section className={styles.workspace}>
            <article className={styles.assistantPanel} id="assistant">
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.eyebrow}>Asistente IA</p>
                  <h3>Rutina guiada sin texto libre</h3>
                </div>
                <span>{currentStep + 1} de {steps.length}</span>
              </div>

              <div className={`${styles.healthBanner} ${styles[modelHealth.status]}`}>
                <span>{modelHealth.message}</span>
                <button type="button" onClick={checkModelHealth}>Probar conexión</button>
              </div>

              <div className={styles.progressTrack} aria-hidden="true">
                <div style={{ width: `${progress}%` }} />
              </div>

              <fieldset className={styles.stepGroup}>
                <legend>{selectedStep.question}</legend>
                <div className={styles.optionGrid}>
                  {options[selectedStep.key].map((option) => (
                    <button
                      className={`${styles.option} ${
                        answers[selectedStep.key] === option.id ? styles.selected : ""
                      }`}
                      key={option.id}
                      type="button"
                      onClick={() => selectAnswer(selectedStep.key, option.id)}
                    >
                      <strong>{option.label}</strong>
                      <span>{option.description}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className={styles.actions}>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => setCurrentStep((step) => Math.max(step - 1, 0))}
                  disabled={currentStep === 0}
                >
                  Anterior
                </button>
                {currentStep < steps.length - 1 ? (
                  <button
                    className={styles.primaryButton}
                    type="button"
                    onClick={() => setCurrentStep((step) => step + 1)}
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    className={styles.primaryButton}
                    type="button"
                    onClick={generatePlan}
                    disabled={isLoading}
                  >
                    {isLoading ? "Generando..." : "Generar rutina"}
                  </button>
                )}
              </div>
            </article>

            <aside className={styles.summaryPanel} id="routine">
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.eyebrow}>Parámetros seguros</p>
                  <h3>Selección actual</h3>
                </div>
              </div>

              <ul className={styles.selectionList}>
                {selectedLabels.map((item) => (
                  <li key={item.key}>
                    <span>{steps.find((step) => step.key === item.key)?.title}</span>
                    <strong>{item.label}</strong>
                  </li>
                ))}
              </ul>

              {plan ? (
                <div className={styles.botResponse} aria-live="polite">
                  <span className={styles.apiBadge}>
                    {apiStatus === "model" ? "Python conectado" : apiStatus === "fallback" ? "Modo respaldo" : "Pendiente"}
                  </span>
                  <h4>{plan.title}</h4>
                  <div className={styles.modelMeta}>
                    <span>Modelo: {plan.model || "reglas"}</span>
                    <span>Fuente: {plan.predictionSource || "fallback"}</span>
                    <span>Casos coach: {plan.trainedWithCoachApprovedCases ?? 0}</span>
                    {plan.confidence ? <span>Confianza: {Math.round(plan.confidence * 100)}%</span> : null}
                  </div>
                  <p>{plan.summary}</p>
                  <p className={styles.coachNote}>
                    Esta sugerencia usa casos aprobados por entrenador y debe validarse con un coach si hay dolor, lesión o duda técnica.
                  </p>
                  <ul>
                    {plan.split.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <ol>
                    {plan.recommendations.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                  <div className={styles.questionBox}>
                    <strong>Pregunta sobre tu rutina</strong>
                    <div className={styles.questionButtons}>
                      {routineQuestions.map((question) => (
                        <button
                          key={question.id}
                          type="button"
                          onClick={() => askRoutineQuestion(question.id)}
                          disabled={questionLoading !== null}
                        >
                          {questionLoading === question.id ? "..." : question.label}
                        </button>
                      ))}
                    </div>
                    {routineAnswer ? (
                      <div className={styles.answerBubble} aria-live="polite">
                        <span>{routineAnswer.question}</span>
                        <p>{routineAnswer.answer}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  Completa el cuestionario para recibir una rutina inicial generada
                  desde parámetros validados.
                </div>
              )}
            </aside>
          </section>
        </section>
      </main>
    </>
  );
}
