import argparse
import csv
import json
import math
from collections import Counter, defaultdict
from pathlib import Path


FEATURES = ["experience", "limitation", "goal", "days"]
ALLOWED_VALUES = {
    "experience": {"beginner", "intermediate"},
    "limitation": {"none", "upper_body", "lower_body"},
    "goal": {"hypertrophy", "recomposition", "conditioning"},
    "days": {"3", "4", "5"},
}

ROUTINE_DETAILS = {
    "fullbody_hypertrophy": {
        "title": "Fullbody de hipertrofia",
        "split": ["Dia 1: Fullbody A", "Dia 2: Fullbody B", "Dia 3: Fullbody C"],
        "focus": "Aprender tecnica y ganar masa muscular con volumen moderado.",
    },
    "upper_lower_hypertrophy": {
        "title": "Torso/Pierna de hipertrofia",
        "split": ["Dia 1: Torso", "Dia 2: Pierna", "Dia 3: Torso", "Dia 4: Pierna"],
        "focus": "Separar grupos musculares para progresar con mas volumen semanal.",
    },
    "push_pull_legs_base": {
        "title": "Empuje/Jalon/Pierna base",
        "split": ["Dia 1: Empuje", "Dia 2: Jalon", "Dia 3: Pierna", "Dia 4: Torso", "Dia 5: Fullbody"],
        "focus": "Frecuencia alta con cargas conservadoras para crear habito.",
    },
    "fullbody_strength_hypertrophy": {
        "title": "Fullbody fuerza e hipertrofia",
        "split": ["Dia 1: Fuerza base", "Dia 2: Hipertrofia", "Dia 3: Accesorios"],
        "focus": "Mantener ejercicios compuestos y progresion semanal controlada.",
    },
    "push_pull_legs_hypertrophy": {
        "title": "Empuje/Jalon/Pierna hipertrofia",
        "split": ["Dia 1: Empuje", "Dia 2: Jalon", "Dia 3: Pierna", "Dia 4: Empuje/Jalon", "Dia 5: Pierna/Core"],
        "focus": "Aumentar volumen por patron de movimiento sin saturar una sola sesion.",
    },
    "fullbody_machine_safe": {
        "title": "Fullbody seguro en maquinas",
        "split": ["Dia 1: Maquinas base", "Dia 2: Tren inferior guiado", "Dia 3: Fullbody ligero"],
        "focus": "Reducir riesgo articular usando rangos estables y cargas faciles de controlar.",
    },
    "lower_focus_upper_safe": {
        "title": "Pierna con tren superior protegido",
        "split": ["Dia 1: Pierna", "Dia 2: Jalon suave", "Dia 3: Pierna/Core", "Dia 4: Fullbody seguro"],
        "focus": "Evitar empujes verticales pesados y mantener trabajo de tren superior sin dolor.",
    },
    "upper_lower_joint_safe": {
        "title": "Torso/Pierna con cuidado articular",
        "split": ["Dia 1: Torso seguro", "Dia 2: Pierna guiada", "Dia 3: Torso accesorios", "Dia 4: Pierna/Core"],
        "focus": "Conservar frecuencia sin movimientos que agraven articulaciones sensibles.",
    },
    "push_pull_legs_joint_safe": {
        "title": "Empuje/Jalon/Pierna adaptada",
        "split": ["Dia 1: Empuje seguro", "Dia 2: Jalon", "Dia 3: Pierna guiada", "Dia 4: Torso", "Dia 5: Core/Cardio"],
        "focus": "Mantener una division completa con sustituciones seguras.",
    },
    "fullbody_recomposition": {
        "title": "Fullbody de recomposicion",
        "split": ["Dia 1: Fuerza total", "Dia 2: Fullbody + cardio", "Dia 3: Metabolico"],
        "focus": "Combinar fuerza y gasto energetico para bajar grasa sin perder musculo.",
    },
    "upper_lower_recomposition": {
        "title": "Torso/Pierna de recomposicion",
        "split": ["Dia 1: Torso", "Dia 2: Pierna", "Dia 3: Torso + cardio", "Dia 4: Pierna + core"],
        "focus": "Distribuir fuerza, accesorios y cardio moderado.",
    },
    "push_pull_legs_conditioning": {
        "title": "Empuje/Jalon/Pierna con acondicionamiento",
        "split": ["Dia 1: Empuje", "Dia 2: Jalon", "Dia 3: Pierna", "Dia 4: Circuito", "Dia 5: Cardio/Fuerza"],
        "focus": "Mejorar capacidad fisica con volumen alto y descansos medidos.",
    },
    "low_impact_recomposition": {
        "title": "Recomposicion de bajo impacto",
        "split": ["Dia 1: Fullbody guiado", "Dia 2: Cardio bajo impacto", "Dia 3: Fuerza tecnica"],
        "focus": "Evitar impacto fuerte y proteger rodilla/lumbar mientras se mejora composicion corporal.",
    },
    "low_impact_upper_lower": {
        "title": "Torso/Pierna de bajo impacto",
        "split": ["Dia 1: Torso", "Dia 2: Pierna guiada", "Dia 3: Torso + cardio", "Dia 4: Pierna movilidad"],
        "focus": "Sostener progreso semanal con patrones de bajo impacto.",
    },
    "fullbody_conditioning": {
        "title": "Fullbody de acondicionamiento",
        "split": ["Dia 1: Fullbody circuito", "Dia 2: Fuerza ligera", "Dia 3: Cardio + core"],
        "focus": "Mejorar resistencia general con tecnica simple y descansos cortos.",
    },
    "upper_lower_conditioning": {
        "title": "Torso/Pierna de acondicionamiento",
        "split": ["Dia 1: Torso circuito", "Dia 2: Pierna ligera", "Dia 3: Torso + cardio", "Dia 4: Pierna + core"],
        "focus": "Aumentar condicion fisica sin perder estructura de fuerza.",
    },
    "fullbody_conditioning_safe": {
        "title": "Acondicionamiento seguro fullbody",
        "split": ["Dia 1: Circuito guiado", "Dia 2: Cardio bajo impacto", "Dia 3: Fullbody ligero"],
        "focus": "Moverse mas sin sobrecargar hombros, munecas o articulaciones sensibles.",
    },
    "low_impact_conditioning": {
        "title": "Acondicionamiento de bajo impacto",
        "split": ["Dia 1: Fuerza guiada", "Dia 2: Bicicleta o caminata", "Dia 3: Fullbody movilidad"],
        "focus": "Mejorar salud cardiovascular cuidando rodilla y zona lumbar.",
    },
}


class CategoricalNaiveBayes:
    def fit(self, rows):
        self.rows = rows
        self.class_counts = Counter(row["routine_type"] for row in rows)
        self.total = len(rows)
        self.feature_counts = {
            feature: defaultdict(Counter) for feature in FEATURES
        }

        for row in rows:
            routine_type = row["routine_type"]
            for feature in FEATURES:
                self.feature_counts[feature][routine_type][row[feature]] += 1

    def predict(self, sample):
        exact_matches = [
            row["routine_type"]
            for row in self.rows
            if all(row[feature] == sample[feature] for feature in FEATURES)
        ]

        if exact_matches:
            routine_type, count = Counter(exact_matches).most_common(1)[0]
            return {
                "routine_type": routine_type,
                "confidence": round(count / len(exact_matches), 3),
                "prediction_source": "exact_coach_case",
            }

        scores = {}
        class_total = len(self.class_counts)

        for routine_type, count in self.class_counts.items():
            score = math.log((count + 1) / (self.total + class_total))

            for feature in FEATURES:
                values_total = len(ALLOWED_VALUES[feature])
                value_count = self.feature_counts[feature][routine_type][sample[feature]]
                probability = (value_count + 1) / (count + values_total)
                score += math.log(probability)

            scores[routine_type] = score

        winner = max(scores, key=scores.get)
        confidence = self._confidence(scores, winner)
        return {
            "routine_type": winner,
            "confidence": confidence,
            "prediction_source": "probabilistic_model",
        }

    def _confidence(self, scores, winner):
        max_score = max(scores.values())
        normalized = {
            routine_type: math.exp(score - max_score)
            for routine_type, score in scores.items()
        }
        denominator = sum(normalized.values())
        return round(normalized[winner] / denominator, 3)


def load_training_rows(path):
    with path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))

    if not rows:
        raise ValueError("El dataset de entrenamiento esta vacio.")

    for row in rows:
        for feature in FEATURES:
            if row[feature] not in ALLOWED_VALUES[feature]:
                raise ValueError(f"Valor no permitido en entrenamiento: {feature}={row[feature]}")

        if row["routine_type"] not in ROUTINE_DETAILS:
            raise ValueError(f"Rutina sin detalle configurado: {row['routine_type']}")

    return rows


def validate_sample(payload):
    sample = {}

    for feature in FEATURES:
        value = str(payload.get(feature, ""))

        if value not in ALLOWED_VALUES[feature]:
            raise ValueError(f"Parametro no permitido: {feature}")

        sample[feature] = value

    return sample


def main():
    parser = argparse.ArgumentParser(description="Modelo supervisado para sugerir rutina.")
    parser.add_argument("--input-json", required=True)
    parser.add_argument(
        "--training-csv",
        default=str(Path(__file__).with_name("training_cases.csv")),
    )
    args = parser.parse_args()

    payload = json.loads(args.input_json)
    sample = validate_sample(payload)
    rows = load_training_rows(Path(args.training_csv))

    model = CategoricalNaiveBayes()
    model.fit(rows)
    prediction = model.predict(sample)
    routine_type = prediction["routine_type"]
    detail = ROUTINE_DETAILS[routine_type]

    print(json.dumps({
        "model": "categorical_naive_bayes_supervised",
        "trainedWithCoachApprovedCases": len(rows),
        "routineType": routine_type,
        "confidence": prediction["confidence"],
        "predictionSource": prediction["prediction_source"],
        "inputFeatures": sample,
        "title": detail["title"],
        "split": detail["split"],
        "focus": detail["focus"],
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
