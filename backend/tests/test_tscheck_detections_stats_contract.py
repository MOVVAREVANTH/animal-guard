"""Criterion: Backend read endpoints match the documented contract.

GET /api/detections?category=&limit= ; invalid category -> 400.
GET /api/stats -> {total, wild, cattle, domestic} with total >= sum of category counts.
"""


def test_detections_list_wild_category_contract(client):
    resp = client.get("/detections", params={"category": "wild", "limit": 50})
    assert resp.status_code == 200, resp.text
    rows = resp.json()
    assert isinstance(rows, list)
    if rows:
        row = rows[0]
        for field in [
            "id",
            "species",
            "category",
            "confidence",
            "image_url",
            "flickr_reference_url",
            "flickr_page_url",
            "created_at",
        ]:
            assert field in row, f"missing field {field} in {row}"
        assert row["category"] == "wild"
        # newest-first ordering
        if len(rows) > 1:
            assert rows[0]["created_at"] >= rows[-1]["created_at"]


def test_detections_list_invalid_category_400(client):
    resp = client.get("/detections", params={"category": "not-a-real-category"})
    assert resp.status_code == 400, resp.text


def test_stats_contract(client):
    resp = client.get("/stats")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    for field in ["total", "wild", "cattle", "domestic"]:
        assert field in data
    assert data["total"] >= data["wild"] + data["cattle"] + data["domestic"]
