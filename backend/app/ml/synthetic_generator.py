"""
GenCash Synthetic MFS Data Generator
DIU CPC x upay AI Hackathon 2026 - Track 04: Growth & Campaign Intelligence

Generates realistic, statistically sound synthetic customer profiles,
transaction sequences, and campaign engagement histories following the
Hackathon Guideline (Section 11: Data Strategy - No Production Data Required).
"""

import random
from datetime import datetime, timedelta
import pandas as pd
import numpy as np


PERSONAS = [
    {
        "archetype": "STUDENT_YOUTH",
        "weight": 0.35,
        "avg_balance": 850.0,
        "preferred_categories": ["RECHARGE", "SEND_MONEY"],
        "avg_txn_amount": 150.0,
        "peak_hours": [19, 20, 21, 22, 23],
        "cashback_sensitivity": 0.85,
        "primary_operator": "GP",
    },
    {
        "archetype": "URBAN_PRO",
        "weight": 0.25,
        "avg_balance": 8500.0,
        "preferred_categories": ["MERCHANT_PAY", "ADD_MONEY", "RECHARGE"],
        "avg_txn_amount": 1200.0,
        "peak_hours": [12, 13, 18, 19, 20],
        "cashback_sensitivity": 0.65,
        "primary_operator": "ROBI",
    },
    {
        "archetype": "FAMILY_HEAD",
        "weight": 0.25,
        "avg_balance": 14000.0,
        "preferred_categories": ["BILL_PAY", "SEND_MONEY", "CASH_OUT"],
        "avg_txn_amount": 2500.0,
        "peak_hours": [9, 10, 17, 18],
        "cashback_sensitivity": 0.50,
        "primary_operator": "BANGLALINK",
    },
    {
        "archetype": "DORMANT_AT_RISK",
        "weight": 0.15,
        "avg_balance": 350.0,
        "preferred_categories": ["CASH_OUT"],
        "avg_txn_amount": 500.0,
        "peak_hours": [14, 15],
        "cashback_sensitivity": 0.30,
        "primary_operator": "TELETALK",
    },
]

CAMPAIGN_OFFERS = [
    {
        "offer_id": "off_gp_recharge",
        "title": "৳৭৯৯ গ্রামীণফোন রিচার্জে ৳৭৯ ক্যাশব্যাক",
        "category": "RECHARGE",
        "min_amount": 799.0,
        "discount_value": 79.0,
        "target_archetype": "STUDENT_YOUTH",
    },
    {
        "offer_id": "off_card_add_money",
        "title": "কার্ড থেকে ৳৫,০০০ অ্যাড মানিতে ৳১০০ বোনাস",
        "category": "ADD_MONEY",
        "min_amount": 5000.0,
        "discount_value": 100.0,
        "target_archetype": "URBAN_PRO",
    },
    {
        "offer_id": "off_merchant_discount",
        "title": "আউটলেট ও রেস্টুরেন্টে ১৫% মার্চেন্ট ছাড়",
        "category": "MERCHANT_PAY",
        "min_amount": 1000.0,
        "discount_value": 150.0,
        "target_archetype": "URBAN_PRO",
    },
    {
        "offer_id": "off_desco_bill_pay",
        "title": "বিদ্যুৎ বিলে ০% ফি সহ ৳৩০ ক্যাশব্যাক",
        "category": "BILL_PAY",
        "min_amount": 1500.0,
        "discount_value": 30.0,
        "target_archetype": "FAMILY_HEAD",
    },
]


def generate_synthetic_dataset(num_users: int = 1000, seed: int = 42):
    """
    Generates interconnected synthetic tables:
    1. Users (Demographics, Archetype, Balance)
    2. Transactions (60-day historical logs)
    3. Campaign Responses (Historical A/B tests with view/click/convert)
    """
    random.seed(seed)
    np.random.seed(seed)

    now = datetime.utcnow()
    users = []
    transactions = []
    campaign_responses = []

    # 1. Generate User Base
    for user_id in range(1, num_users + 1):
        persona_choice = random.choices(
            PERSONAS, weights=[p["weight"] for p in PERSONAS], k=1
        )[0]

        balance = round(
            max(50.0, np.random.normal(persona_choice["avg_balance"], persona_choice["avg_balance"] * 0.3)),
            2,
        )
        created_days_ago = random.randint(30, 365)
        created_at = now - timedelta(days=created_days_ago)

        user = {
            "user_id": user_id,
            "archetype": persona_choice["archetype"],
            "wallet_balance": balance,
            "created_at": created_at,
            "primary_operator": persona_choice["primary_operator"],
            "cashback_sensitivity": persona_choice["cashback_sensitivity"],
            "avg_txn_amount": persona_choice["avg_txn_amount"],
            "preferred_category": random.choice(persona_choice["preferred_categories"]),
        }
        users.append(user)

        # 2. Generate Transactions for this user (last 60 days)
        if persona_choice["archetype"] == "DORMANT_AT_RISK":
            num_txns = random.randint(1, 4)
        else:
            num_txns = random.randint(12, 45)

        for txn_idx in range(num_txns):
            days_ago = random.uniform(0.1, 60)
            txn_time = now - timedelta(days=days_ago)
            # Adjust hour to persona peak hours
            txn_hour = random.choice(persona_choice["peak_hours"])
            txn_time = txn_time.replace(hour=txn_hour, minute=random.randint(0, 59))

            # Category probability based on persona
            if random.random() < 0.70:
                cat = random.choice(persona_choice["preferred_categories"])
            else:
                cat = random.choice(["RECHARGE", "SEND_MONEY", "MERCHANT_PAY", "BILL_PAY", "ADD_MONEY", "CASH_OUT"])

            amount = round(
                max(20.0, np.random.normal(persona_choice["avg_txn_amount"], persona_choice["avg_txn_amount"] * 0.25)),
                2,
            )

            transactions.append({
                "transaction_id": f"txn_{user_id}_{txn_idx}",
                "user_id": user_id,
                "amount": amount,
                "category": cat,
                "created_at": txn_time,
                "hour_of_day": txn_hour,
                "day_of_week": txn_time.weekday(),
            })

        # 3. Generate Campaign Responses (Past 30 days history)
        # Each user received 3 to 8 promotional offers
        num_campaigns_received = random.randint(3, 8)
        unresponsive_streak = 0

        for c_idx in range(num_campaigns_received):
            offer = random.choice(CAMPAIGN_OFFERS)
            c_days_ago = random.uniform(1, 30)
            sent_at = now - timedelta(days=c_days_ago)

            # Uplift & Propensity Logic:
            # Match between user preference & offer category significantly boosts response
            base_prob = 0.08
            is_matched_category = offer["category"] in persona_choice["preferred_categories"]
            is_matched_archetype = offer["target_archetype"] == persona_choice["archetype"]

            if is_matched_category:
                base_prob += 0.35
            if is_matched_archetype:
                base_prob += 0.25

            # Offer Fatigue Penalty:
            if unresponsive_streak >= 3:
                base_prob *= 0.20  # Massive drop due to offer fatigue

            # Probability of viewing
            viewed = random.random() < min(0.95, base_prob + 0.40)
            # Probability of clicking
            clicked = viewed and (random.random() < min(0.85, base_prob + 0.20))
            # Probability of converting (actually taking the offer)
            converted = clicked and (random.random() < min(0.75, base_prob))

            if converted:
                unresponsive_streak = 0
                txn_val = offer["min_amount"] + round(random.uniform(10, 200), 2)
            else:
                unresponsive_streak += 1
                txn_val = 0.0

            campaign_responses.append({
                "response_id": f"resp_{user_id}_{c_idx}",
                "user_id": user_id,
                "offer_id": offer["offer_id"],
                "offer_category": offer["category"],
                "sent_at": sent_at,
                "viewed": viewed,
                "clicked": clicked,
                "converted": converted,
                "transaction_value": txn_val,
                "unresponsive_streak": unresponsive_streak,
            })

    users_df = pd.DataFrame(users)
    transactions_df = pd.DataFrame(transactions)
    responses_df = pd.DataFrame(campaign_responses)

    return users_df, transactions_df, responses_df


if __name__ == "__main__":
    print("Generating synthetic dataset...")
    u_df, t_df, r_df = generate_synthetic_dataset(1000)
    print(f"Users generated: {len(u_df)}")
    print(f"Transactions generated: {len(t_df)}")
    print(f"Campaign responses generated: {len(r_df)}")
    print("Conversion rate in dataset:", f"{r_df['converted'].mean() * 100:.2f}%")
