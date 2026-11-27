FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app

RUN useradd --create-home nlp
COPY requirements.txt requirements-dev.txt ./
ARG DEV=false
RUN pip install --no-cache-dir -r requirements.txt \
    && if [ "$DEV" = "true" ]; then pip install --no-cache-dir -r requirements-dev.txt; fi

COPY app.py test_app.py ./
USER nlp
EXPOSE 8000
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=5 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')" || exit 1
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--no-access-log"]
