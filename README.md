# GymSAAS

SaaS inicial para gimnasio con:

- Dashboard administrativo.
- Dashboard de usuario.
- Asistente de rutina sin texto libre.
- Backend Node con validacion por whitelist.
- Herramienta Python de aprendizaje supervisado entrenada con casos aprobados por coach.

## Requisitos

- Node.js
- pnpm
- Python 3

Si Python no esta en el PATH, configura `PYTHON_BIN` con la ruta completa a `python.exe`.

## Ejecutar

Instala dependencias:

```bash
pnpm install
```

Levanta todo:

```bash
pnpm dev
```

O levanta cada pieza por separado:

```bash
pnpm dev:backend
pnpm dev:client
pnpm dev:admin
```

URLs principales:

- Cliente: http://localhost:3000
- Admin: normalmente http://localhost:3000 si lo levantas solo
- Si levantas admin y cliente juntos, Next puede mover una app a http://localhost:3001. La vista que usa Python es la que dice `Dashboard de usuario`, no el panel admin.
- Backend: http://localhost:4000/health
- Diagnostico Python: http://localhost:4000/ai/model-health

## Probar el modelo supervisado

```bash
python packages/ml-routine/routine_model.py --input-json "{\"experience\":\"beginner\",\"limitation\":\"none\",\"goal\":\"hypertrophy\",\"days\":\"3\"}"
```

Debe devolver una rutina, el tipo de modelo, confianza y si la prediccion salio de un caso exacto aprobado por coach.

## Probar la API

```bash
curl -X POST http://localhost:4000/ai/workout-plan ^
  -H "Content-Type: application/json" ^
  -d "{\"experience\":\"beginner\",\"limitation\":\"none\",\"goal\":\"hypertrophy\",\"days\":\"3\"}"
```

Preguntas permitidas sobre la rutina:

```bash
curl -X POST http://localhost:4000/ai/routine-question ^
  -H "Content-Type: application/json" ^
  -d "{\"experience\":\"beginner\",\"limitation\":\"none\",\"goal\":\"hypertrophy\",\"days\":\"3\",\"questionType\":\"why\"}"
```

`questionType` permite: `why`, `warmup`, `progress`, `pain`.
