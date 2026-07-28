import http from "node:http";
import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT || 4000);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mlScriptPath = path.resolve(__dirname, "../ml-routine/routine_model.py");
const pythonCandidates = process.env.PYTHON_BIN
  ? [process.env.PYTHON_BIN]
  : ["python", "python3", "py"];

const whitelist = {
  experience: {
    beginner: "Principiante con menos de 3 meses de entrenamiento",
    intermediate: "Intermedio con 3 a 12 meses de entrenamiento",
  },
  limitation: {
    none: "Sin limitaciones fisicas declaradas",
    upper_body: "Limitar empujes verticales y sobrecarga de hombros o munecas",
    lower_body: "Limitar impactos severos y sentadillas profundas con barra libre",
  },
  goal: {
    hypertrophy: "Hipertrofia y fuerza",
    recomposition: "Recomposicion corporal o perdida de grasa",
    conditioning: "Acondicionamiento cardiovascular y salud general",
  },
  days: {
    3: "3 dias por semana",
    4: "4 dias por semana",
    5: "5 dias por semana",
  },
};

const splitByDays = {
  3: ["Dia 1: Fullbody tecnico", "Dia 2: Fullbody fuerza base", "Dia 3: Fullbody metabólico"],
  4: ["Dia 1: Torso", "Dia 2: Pierna", "Dia 3: Torso accesorio", "Dia 4: Pierna y core"],
  5: ["Dia 1: Empuje", "Dia 2: Jalon", "Dia 3: Pierna", "Dia 4: Torso", "Dia 5: Fullbody ligero"],
};

const goalRecommendations = {
  hypertrophy: [
    "Trabaja de 3 a 4 series por ejercicio con 8 a 12 repeticiones.",
    "Sube el peso solo cuando mantengas tecnica limpia en todas las series.",
    "Descansa 60 a 90 segundos entre series principales.",
  ],
  recomposition: [
    "Combina fuerza con 12 a 18 minutos de cardio moderado al final.",
    "Prioriza ejercicios compuestos y registra medidas cada 2 semanas.",
    "Mantén intensidad moderada para sostener musculo mientras bajas grasa.",
  ],
  conditioning: [
    "Usa circuitos controlados con descansos cortos y buena respiracion.",
    "Incluye movilidad dinamica antes de la rutina.",
    "Aumenta el volumen semanal poco a poco para cuidar articulaciones.",
  ],
};

const limitationNotes = {
  none: "Puedes usar patrones basicos de empuje, jalon, sentadilla, bisagra y core.",
  upper_body: "Evita press militar pesado; usa agarres neutros, maquinas y rangos sin dolor.",
  lower_body: "Evita impacto alto; prioriza prensa, bisagra controlada y rangos parciales seguros.",
};

const routineQuestions = {
  why: "¿Por que me conviene esta rutina?",
  warmup: "¿Como debo calentar?",
  progress: "¿Como progreso cada semana?",
  pain: "¿Que hago si siento dolor?",
};

function setCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;

      if (body.length > 1000) {
        reject(new Error("Payload demasiado grande"));
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error("JSON invalido"));
      }
    });

    request.on("error", reject);
  });
}

function validatePayload(payload) {
  const safeValues = {};

  for (const key of Object.keys(whitelist)) {
    const value = String(payload[key] || "");

    if (!Object.prototype.hasOwnProperty.call(whitelist[key], value)) {
      return {
        ok: false,
        error: `Parametro no permitido: ${key}`,
      };
    }

    safeValues[key] = value;
  }

  return { ok: true, safeValues };
}

function validateRoutineQuestion(payload) {
  const planValidation = validatePayload(payload);

  if (!planValidation.ok) {
    return planValidation;
  }

  const questionType = String(payload.questionType || "");

  if (!Object.prototype.hasOwnProperty.call(routineQuestions, questionType)) {
    return {
      ok: false,
      error: "Pregunta no permitida",
    };
  }

  return {
    ok: true,
    safeValues: planValidation.safeValues,
    questionType,
  };
}

function buildPrompt(values) {
  return `
Eres un asistente de gimnasio para usuarios nuevos. Genera una rutina segura, clara y breve.
Usa solo estos parametros validados por backend:
- Experiencia: ${whitelist.experience[values.experience]}
- Limitacion: ${whitelist.limitation[values.limitation]}
- Objetivo: ${whitelist.goal[values.goal]}
- Disponibilidad: ${whitelist.days[values.days]}
No diagnostiques lesiones. Recomienda consultar a un coach si aparece dolor.
`.trim();
}

function buildPlan(values) {
  const levelText = values.experience === "beginner" ? "inicial" : "progresiva";
  const titleByGoal = {
    hypertrophy: `Rutina ${levelText} de hipertrofia`,
    recomposition: `Rutina ${levelText} de recomposicion`,
    conditioning: `Rutina ${levelText} de acondicionamiento`,
  };

  return {
    title: titleByGoal[values.goal],
    summary: `${whitelist.experience[values.experience]}. ${limitationNotes[values.limitation]} Entrena ${whitelist.days[values.days].toLowerCase()} con tecnica estable y esfuerzo moderado.`,
    split: splitByDays[values.days],
    recommendations: goalRecommendations[values.goal],
  };
}

function runPythonRoutineModel(values) {
  const inputJson = JSON.stringify(values);

  const tryCandidate = (index) =>
    new Promise((resolve, reject) => {
      const pythonBin = pythonCandidates[index];
      const args = pythonBin === "py"
        ? ["-3", mlScriptPath, "--input-json", inputJson]
        : [mlScriptPath, "--input-json", inputJson];

      execFile(
        pythonBin,
        args,
        { timeout: 5000, windowsHide: true },
        (error, stdout, stderr) => {
          if (error) {
            if (index < pythonCandidates.length - 1) {
              tryCandidate(index + 1).then(resolve).catch(reject);
              return;
            }

            reject(new Error(stderr || error.message));
            return;
          }

          try {
            resolve(JSON.parse(stdout));
          } catch (parseError) {
            reject(new Error("La herramienta Python devolvio una respuesta invalida."));
          }
        }
      );
    });

  return tryCandidate(0);
}

function buildPlanFromPrediction(values, prediction) {
  return {
    title: prediction.title,
    routineType: prediction.routineType,
    confidence: prediction.confidence,
    predictionSource: prediction.predictionSource,
    model: prediction.model,
    trainedWithCoachApprovedCases: prediction.trainedWithCoachApprovedCases,
    summary: `${prediction.focus} ${limitationNotes[values.limitation]} Recomendacion generada por modelo supervisado entrenado con casos reales aprobados por coach.`,
    split: prediction.split,
    recommendations: [
      "Trabaja con tecnica limpia y deja 1 a 2 repeticiones en reserva.",
      "Registra ejercicios, pesos y repeticiones para que el coach pueda validar avances.",
      ...goalRecommendations[values.goal].slice(0, 1),
    ],
  };
}

function buildRoutineAnswer(values, questionType, plan) {
  const answers = {
    why: `Te conviene porque tu perfil indica ${whitelist.experience[values.experience].toLowerCase()}, objetivo de ${whitelist.goal[values.goal].toLowerCase()} y disponibilidad de ${whitelist.days[values.days].toLowerCase()}. El modelo eligio ${plan.title} porque coincide con casos aprobados por entrenador.`,
    warmup: "Haz 5 a 8 minutos de cardio suave, movilidad de articulaciones principales y 2 series ligeras del primer ejercicio antes de subir carga.",
    progress: "Cuando completes todas las repeticiones con buena tecnica durante dos sesiones, sube un poco el peso o agrega 1 repeticion por serie.",
    pain: "Si aparece dolor articular, detén ese ejercicio, baja la carga y pide revision del coach. No intentes entrenar sobre dolor punzante.",
  };

  return {
    question: routineQuestions[questionType],
    answer: answers[questionType],
    safety: {
      freeTextAccepted: false,
      questionWhitelistValidated: true,
    },
  };
}

async function getModelHealth() {
  const sampleValues = {
    experience: "beginner",
    limitation: "none",
    goal: "hypertrophy",
    days: "3",
  };
  const prediction = await runPythonRoutineModel(sampleValues);

  return {
    ok: true,
    service: "ml-routine",
    model: prediction.model,
    routineType: prediction.routineType,
    predictionSource: prediction.predictionSource,
    trainedWithCoachApprovedCases: prediction.trainedWithCoachApprovedCases,
  };
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}

const server = http.createServer(async (request, response) => {
  setCors(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, { ok: true, service: "apis-backend" });
    return;
  }

  if (request.method === "GET" && request.url === "/ai/model-health") {
    try {
      sendJson(response, 200, await getModelHealth());
    } catch (error) {
      sendJson(response, 503, {
        ok: false,
        service: "ml-routine",
        error: "Python no esta disponible para ejecutar el modelo supervisado.",
        detail: error.message,
      });
    }

    return;
  }

  if (request.method === "POST" && request.url === "/ai/workout-plan") {
    try {
      const payload = await readJson(request);
      const validation = validatePayload(payload);

      if (!validation.ok) {
        sendJson(response, 400, { error: validation.error });
        return;
      }

      const prompt = buildPrompt(validation.safeValues);
      let plan;
      let mlStatus = "python_model";

      try {
        const prediction = await runPythonRoutineModel(validation.safeValues);
        plan = buildPlanFromPrediction(validation.safeValues, prediction);
      } catch (error) {
        mlStatus = "fallback_rules";
        plan = buildPlan(validation.safeValues);
      }

      sendJson(response, 200, {
        plan,
        promptPreview: prompt,
        mlStatus,
        safety: {
          freeTextAccepted: false,
          whitelistValidated: true,
          supervisedModelEnabled: mlStatus === "python_model",
          maxPayloadBytes: 1000,
        },
      });
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }

    return;
  }

  if (request.method === "POST" && request.url === "/ai/routine-question") {
    try {
      const payload = await readJson(request);
      const validation = validateRoutineQuestion(payload);

      if (!validation.ok) {
        sendJson(response, 400, { error: validation.error });
        return;
      }

      let plan;

      try {
        const prediction = await runPythonRoutineModel(validation.safeValues);
        plan = buildPlanFromPrediction(validation.safeValues, prediction);
      } catch (error) {
        plan = buildPlan(validation.safeValues);
      }

      sendJson(response, 200, {
        response: buildRoutineAnswer(validation.safeValues, validation.questionType, plan),
      });
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }

    return;
  }

  sendJson(response, 404, { error: "Ruta no encontrada" });
});

server.listen(PORT, () => {
  console.log(`apis-backend listo en http://localhost:${PORT}`);
});
