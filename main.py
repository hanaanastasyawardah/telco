from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

# =========================
# 1. Load artefak CBF
# =========================
scaler = joblib.load("cbf_scaler.pkl")
feature_cols: List[str] = joblib.load("cbf_feature_cols.pkl")
y = joblib.load("cbf_y.pkl")                  # Series target_offer
X_scaled = np.load("cbf_X_scaled.npy")        # shape: (n_users, n_features)

app = FastAPI(
    title="InsightTel CBF Recommender API",
    description="Content-based filtering (user similarity) untuk Next Best Offer",
    version="1.0.0"
)

class CustomerProfile(BaseModel):
    plan_type: str
    avg_call_duration: float
    sms_freq: float
    topup_freq: float
    travel_score: float
    complaint_count: int
    video_gb_usage: float
    spend_per_gb: float
    top_k: int = 3

@app.get("/")
def root():
    return {"message": "CBF NBO API is running 🚀"}

@app.post("/recommend_cbf")
def recommend_cbf(profile: CustomerProfile):
    # 1) Bangun row kosong sesuai feature_cols
    row = {col: 0.0 for col in feature_cols}

    # 2) Isi fitur numerik
    row["avg_call_duration"] = profile.avg_call_duration
    row["sms_freq"] = profile.sms_freq
    row["topup_freq"] = profile.topup_freq
    row["travel_score"] = profile.travel_score
    row["complaint_count"] = profile.complaint_count
    row["video_gb_usage"] = profile.video_gb_usage
    row["spend_per_gb"] = profile.spend_per_gb

    # 3) One-hot plan_type
    if "plan_type_Prepaid" in row and "plan_type_Postpaid" in row:
        if profile.plan_type.lower() == "prepaid":
            row["plan_type_Prepaid"] = 1.0
            row["plan_type_Postpaid"] = 0.0
        elif profile.plan_type.lower() == "postpaid":
            row["plan_type_Prepaid"] = 0.0
            row["plan_type_Postpaid"] = 1.0

    df_input = pd.DataFrame([row])
    df_input = df_input[feature_cols]

    # 4) Scaling
    x_scaled = scaler.transform(df_input)

    # 5) Cosine similarity ke semua user training
    sims = cosine_similarity(x_scaled, X_scaled)[0]   # (n_users,)

    # 6) Ambil tetangga paling mirip
    k = max(1, min(profile.top_k, len(sims)))
    sorted_idx = np.argsort(-sims)
    top_idx = sorted_idx[1:k+1]  # buang diri sendiri

    offers = y.iloc[top_idx].tolist()
    sim_scores = sims[top_idx]

    # 7) Unik + batasi top_k
    seen = set()
    recommendations = []
    for offer, score in zip(offers, sim_scores):
        if offer not in seen:
            seen.add(offer)
            recommendations.append({
                "offer": str(offer),
                "similarity_score": float(score)
            })
        if len(recommendations) >= k:
            break

    return {
        "top_k": k,
        "recommendations": recommendations
    }
