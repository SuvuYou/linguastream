from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import whisperx
import uuid
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory job store — survives only while service is running
# Jobs are short-lived (minutes), so this is fine
jobs: dict[str, dict] = {}

DEVICE = "mps"
MODEL_SIZE = "medium"


class TranscribeRequest(BaseModel):
    file_path: str
    language: str | None = None  # None = autodetect
    job_id: str | None = None


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/transcribe")
async def transcribe(req: TranscribeRequest, background_tasks: BackgroundTasks):
    job_id = req.job_id or str(uuid.uuid4())
    jobs[job_id] = {"status": "pending", "result": None, "error": None}
    background_tasks.add_task(run_transcription, job_id, req.file_path, req.language)
    return {"job_id": job_id}


@app.get("/job/{job_id}")
async def get_job(job_id: str):
    job = jobs.get(job_id)
    if not job:
        return {"status": "not_found"}
    return job


def run_transcription(job_id: str, file_path: str, language: str | None):
    try:
        jobs[job_id]["status"] = "running"

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        lang_label = language or "autodetect"
        print(f"[{job_id}] Loading WhisperX model ({MODEL_SIZE}, language={lang_label})...")
        model = whisperx.load_model(MODEL_SIZE, device=DEVICE, language=language)

        print(f"[{job_id}] Loading audio from {file_path}...")
        audio = whisperx.load_audio(file_path)

        print(f"[{job_id}] Transcribing...")
        result = model.transcribe(audio, batch_size=8)

        detected_language = result.get("language", language or "unknown")
        print(f"[{job_id}] Detected language: {detected_language}")

        print(f"[{job_id}] Aligning timestamps...")
        model_a, metadata = whisperx.load_align_model(
            language_code=detected_language, device=DEVICE
        )
        result = whisperx.align(
            result["segments"], model_a, metadata, audio, device=DEVICE,
            return_char_alignments=False
        )

        print(f"[{job_id}] Done. {len(result['segments'])} segments found.")
        jobs[job_id]["status"] = "done"
        jobs[job_id]["result"] = result["segments"]
        jobs[job_id]["detected_language"] = detected_language

    except Exception as e:
        print(f"[{job_id}] Error: {e}")
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"] = str(e)