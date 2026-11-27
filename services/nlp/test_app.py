from fastapi.testclient import TestClient

from app import MAX_SENTENCES, app


def client() -> TestClient:
    return TestClient(app)


def test_health_names_the_model():
    with client() as c:
        assert c.get("/health").json() == {"status": "ok", "model": "de_core_news_sm"}


def test_analyses_each_sentence_into_tokens_with_offsets():
    with client() as c:
        body = c.post("/analyse", json={"sentences": ["Ich fange morgen an.", "Gut!"]}).json()
    assert body["model"] == "de_core_news_sm"
    first, second = body["sentences"]
    assert [t["text"] for t in first] == ["Ich", "fange", "morgen", "an", "."]
    assert [t["start"] for t in first] == [0, 4, 10, 17, 19]
    fange = first[1]
    assert fange["lemma"] == "fangen"
    assert fange["pos"] == "VERB"
    assert "Person=1" in fange["morph"]
    assert first[3]["dep"] == "svp"
    assert first[3]["head"] == 1
    assert [t["text"] for t in second] == ["Gut", "!"]


def test_keeps_an_empty_list_for_an_empty_request():
    with client() as c:
        assert c.post("/analyse", json={"sentences": []}).json()["sentences"] == []


def test_rejects_too_many_sentences_and_bad_bodies():
    with client() as c:
        assert c.post("/analyse", json={"sentences": ["a"] * (MAX_SENTENCES + 1)}).status_code == 422
        assert c.post("/analyse", json={"text": "x"}).status_code == 422


def test_has_no_public_docs():
    with client() as c:
        assert c.get("/docs").status_code == 404
        assert c.get("/openapi.json").status_code == 404
