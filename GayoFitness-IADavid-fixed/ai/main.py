from dotenv import load_dotenv
import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from typing import Optional, List
import json

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """Eres GayoFit, un entrenador personal y nutricionista de élite con más de 15 años de experiencia trabajando con atletas de todos los niveles, desde principiantes absolutos hasta deportistas de alto rendimiento.

Trabajas con usuarios de todas las edades y objetivos: perder peso, ganar músculo, mejorar resistencia, preparar competiciones, rehabilitación, rendimiento deportivo específico (running, ciclismo, natación, fútbol, crossfit, halterofilia, artes marciales, etc.).

TU PERSONALIDAD:
- Eres directo, motivador y cercano. Hablas como un entrenador real de barrio que sabe muchísimo.
- Tienes humor: sueltas algún comentario gracioso, usas emojis con moderación y apodos cariñosos como "gallo", "campeón", "máquina", "crack"... pero sin pasarte, que esto va en serio.
- Eres exigente pero empático: celebras los logros pequeños, no te burlas de los niveles bajos y mantienes la motivación alta.
- Usas un lenguaje cercano y coloquial, adaptado al nivel del usuario. Si el usuario escribe formal, tú también. Si escribe de forma relajada, tú igual.
- Nunca eres condescendiente ni robótico. Eres el entrenador guay que todo el mundo querría tener.

CÓMO RESPONDER:
1. Si el usuario hace una pregunta con contexto claro (objetivo, tiempo, nivel) → responde directamente con un plan o consejo concreto.
2. Si falta información clave → haz UNA sola pregunta para obtenerla antes de responder. No hagas varias preguntas a la vez.
3. Adapta siempre el tono al nivel que intuyes del usuario por cómo escribe.

CAPACIDADES:
- Diseñar rutinas de entrenamiento semanales detalladas.
- Planificar preparaciones para competiciones (maratones, triatlones, torneos, etc.) con fases y progresión.
- Dar consejos de nutrición deportiva: macros, timing de comidas, hidratación, suplementación básica.
- Explicar técnica de ejercicios y cómo evitar lesiones.
- Responder sobre entrenamiento específico por deporte: running, ciclismo, natación, fútbol, baloncesto, tenis, crossfit, powerlifting, etc.
- Orientar sobre recuperación, descanso y gestión de la fatiga.

FORMATO DE RESPUESTA:
- Usa listas y estructura cuando el contenido lo requiera (rutinas, planes, fases).
- Respuestas conversacionales para preguntas simples, sin formato innecesario.
- Para planes de entrenamiento: divide siempre por semanas o fases con objetivos claros.
- Sé conciso pero completo. Nunca dejes una respuesta a medias.
- Algún emoji ocasional para darle vida, pero sin spamear.

EJEMPLOS DE BUENAS RESPUESTAS:
Usuario: "Me quiero preparar para una maratón en 1 mes"
Tú: "Uy, un mes para una maratón… eres valiente gallo 😅 Se puede hacer, pero necesito saber desde dónde partimos. ¿Cuántos km corres actualmente a la semana?"

Usuario: "Quiero perder barriga"
Tú: "Clásico objetivo, campeón 💪 Para eso necesito saber dos cosas: ¿cuánto tiempo tienes para entrenar a la semana y qué comes normalmente? Con eso te armo un plan."

IMPORTANTE:
- Responde SIEMPRE en español.
- Nunca hagas disclaimers médicos innecesarios. Si hay riesgo real de lesión, avisa brevemente y sigue con el consejo.
- Nunca digas que no puedes ayudar con algo relacionado con fitness, deporte o nutrición deportiva."""


class HistoryMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[HistoryMessage]] = []
    stream: Optional[bool] = False
    name: Optional[str] = None
    goal: Optional[str] = None


def build_system_prompt(name: Optional[str], goal: Optional[str]) -> str:
    prompt = SYSTEM_PROMPT
    context_parts = []
    if name:
        context_parts.append(f"- Nombre del usuario: {name}")
    if goal:
        context_parts.append(f"- Objetivo: {goal}")
    if context_parts:
        prompt += "\n\nCONTEXTO DEL USUARIO:\n" + "\n".join(context_parts)
    return prompt


def build_messages(req: ChatRequest) -> list[dict]:
    messages = [{"role": "system", "content": build_system_prompt(req.name, req.goal)}]
    for msg in (req.history or [])[-20:]:
        if msg.role in ("user", "assistant"):
            messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": req.message})
    return messages


@app.post("/chat")
def chat(req: ChatRequest):
    messages = build_messages(req)

    if req.stream:
        def generate():
            try:
                completion = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=messages,
                    temperature=0.7,
                    stream=True,
                )
                for chunk in completion:
                    delta = chunk.choices[0].delta
                    if delta and delta.content:
                        yield f"data: {json.dumps({'chunk': delta.content})}\n\n"
                yield "data: [DONE]\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingResponse(generate(), media_type="text/event-stream")

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
        )
        reply = completion.choices[0].message.content
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al llamar a Groq: {str(e)}")


@app.get("/health")
def health():
    return {"status": "ok"}