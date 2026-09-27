"""Criterion: Invalid image payloads return 422 from the identify endpoint."""


def test_identify_invalid_base64(client):
    resp = client.post("/detections/identify", json={"image_base64": "not-base64!!", "mime_type": "image/jpeg"})
    assert resp.status_code == 422, resp.text
    detail = str(resp.json().get("detail", ""))
    assert "base64" in detail.lower()


def test_identify_unsupported_mime_type(client):
    # valid base64 payload (tiny), but unsupported mime type
    resp = client.post(
        "/detections/identify",
        json={"image_base64": "aGVsbG8gd29ybGQ=", "mime_type": "image/gif"},
    )
    assert resp.status_code == 422, resp.text
    detail = str(resp.json().get("detail", ""))
    assert "gif" in detail.lower() or "jpeg" in detail.lower() or "png" in detail.lower() or "webp" in detail.lower()


def test_identify_missing_image_base64(client):
    resp = client.post("/detections/identify", json={"mime_type": "image/jpeg"})
    assert resp.status_code == 422, resp.text
