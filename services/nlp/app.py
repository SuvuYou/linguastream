from contextlib import asynccontextmanager

import spacy
from fastapi import FastAPI
from pydantic import BaseModel, Field

MODEL_NAME = "de_core_news_sm"
MAX_SENTENCES = 500
MAX_SENTENCE_CHARS = 2_000

models: dict[str, spacy.language.Language] = {}


@asynccontextmanager
async def lifespan(_: FastAPI):
    models["de"] = spacy.load(MODEL_NAME)
    yield
    models.clear()


app = FastAPI(lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)


class AnalyseRequest(BaseModel):
    sentences: list[str] = Field(max_length=MAX_SENTENCES)


class Token(BaseModel):
    start: int
    text: str
    lemma: str
    pos: str
    tag: str
    morph: str
    dep: str
    head: int


class AnalyseResponse(BaseModel):
    model: str
    sentences: list[list[Token]]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model": MODEL_NAME}


@app.post("/analyse")
def analyse(request: AnalyseRequest) -> AnalyseResponse:
    nlp = models["de"]
    texts = [sentence[:MAX_SENTENCE_CHARS] for sentence in request.sentences]
    sentences = [
        [
            Token(
                start=token.idx,
                text=token.text,
                lemma=token.lemma_,
                pos=token.pos_,
                tag=token.tag_,
                morph=str(token.morph),
                dep=token.dep_,
                head=token.head.i,
            )
            for token in doc
            if not token.is_space
        ]
        for doc in nlp.pipe(texts, batch_size=64)
    ]
    return AnalyseResponse(model=MODEL_NAME, sentences=sentences)
