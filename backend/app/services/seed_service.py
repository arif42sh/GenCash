"""
GenCash 100,000 (1 Lakh) High-Performance MFS Synthetic Data Engine
Enterprise Growth & Campaign Intelligence Module

Generates and batch-seeds 100,000 realistic MFS transactions, 3,500 active users,
and campaign uplift histories into MySQL database.
"""

import time
import random
import string
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import insert, func
from app.models.user import User, Wallet
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.models.merchant import Merchant
from app.models.marketing import Offer, Campaign, CampaignResponse
from app.core.security import get_password_hash
from app.ml.nbo_engine import nbo_engine

FIRST_NAMES = [
    "Tanvir", "Sadia", "Rafiqul", "Anika", "Farhan", "Nusrat", "Kamrul", "Mahmudul",
    "Tasnim", "Sakib", "Mehnaz", "Zubair", "Ayesha", "Imtiaz", "Farzana", "Arif",
    "Jannatul", "Rashed", "Shakil", "Tahmid", "Sabrina", "Fahim", "Rumana", "Nafis",
    "Kazi", "Sumaiya", "Rifat", "Shahid", "Maimuna", "Ashraf", "Samira", "Hasibul"
]

LAST_NAMES = [
    "Ahmed", "Rahman", "Islam", "Tabassum", "Kabir", "Jahan", "Hasan", "Hoque",
    "Ferdous", "Alom", "Khanam", "Chowdhury", "Akter", "Uddin", "Bhuiyan", "Sikder",
    "Karim", "Sultana", "Munshi", "Talukder", "Miah", "Hossain", "Sheikh", "Majumder"
]

LOCATIONS = [
    "Dhanmondi, Dhaka", "Gulshan-1, Dhaka", "Gulshan-2, Dhaka", "Banani, Dhaka",
    "Uttara Sector 3, Dhaka", "Uttara Sector 11, Dhaka", "Mirpur-10, Dhaka",
    "Mirpur-2, Dhaka", "Motijheel C/A, Dhaka", "Kawran Bazar, Dhaka",
    "Agrabad C/A, Chattogram", "GEC Circle, Chattogram", "Nasirabad, Chattogram",
    "Zindabazar, Sylhet", "Shibganj, Sylhet", "Shaheb Bazar, Rajshahi",
    "KDA Avenue, Khulna", "Station Road, Rangpur", "Chawkbazar, Barishal",
    "Kandirpar, Cumilla", "Chashara, Narayanganj", "Tongi, Gazipur", "Bogura Sadar, Bogura"
]

OPERATORS = ["Grameenphone", "Robi", "Banglalink", "Airtel", "Teletalk"]
PREFIXES = {
    "Grameenphone": ["017", "013"],
    "Robi": ["018"],
    "Banglalink": ["019", "014"],
    "Airtel": ["016"],
    "Teletalk": ["015"],
}


def _generate_phone(operator: str) -> str:
    pref = random.choice(PREFIXES[operator])
    num = "".join(random.choices(string.digits, k=8))
    return f"{pref}{num}"


def _generate_txn_code() -> str:
    chars = string.ascii_uppercase + string.digits
    return "TRX" + "".join(random.choices(chars, k=9))


class Seed100kEngine:
    @staticmethod
    def seed_powerlaw_dataset(db: Session, reset_txns: bool = True):
        start_time = time.time()
        print("⚡ Starting Realistic Power-Law & Inactive Cohort MFS Generation Engine...")

        if reset_txns:
            print("🧹 Resetting old transactions table for fresh Power-Law distribution...")
            db.query(Transaction).delete()
            db.commit()

        # Fetch all user IDs
        all_users = db.query(User.id).order_by(User.id.asc()).all()
        user_ids = [u[0] for u in all_users]
        total_users = len(user_ids)
        print(f"👥 Total available customers: {total_users}")

        if total_users == 0:
            return {"success": False, "message": "No users found in database."}

        all_agent_ids = [u[0] for u in db.query(User.id).filter(User.is_agent == True).all()]
        all_merchant_ids = [m[0] for m in db.query(Merchant.id).all()]
        if not all_agent_ids:
            all_agent_ids = user_ids[:10]
        if not all_merchant_ids:
            all_merchant_ids = [None]

        # Define 4 Real-world MFS Cohorts across the 100k user base:
        # 1. Dormant (35%): 0-1 txns (35,000 users) -> ~15k-20k txns
        # 2. Casual (45%): 2-5 txns (45,000 users) -> ~135k-150k txns
        # 3. Active (15%): 6-15 txns (15,000 users) -> ~130k-150k txns
        # 4. Power/VIP (5%): 16-35 txns (5,000 users) -> ~100k-120k txns
        
        c1_cutoff = int(total_users * 0.35)
        c2_cutoff = int(total_users * 0.80)
        c3_cutoff = int(total_users * 0.95)

        dormant_users = user_ids[:c1_cutoff]
        casual_users = user_ids[c1_cutoff:c2_cutoff]
        active_users = user_ids[c2_cutoff:c3_cutoff]
        vip_users = user_ids[c3_cutoff:]

        print(f"📊 Segment Breakdown:")
        print(f"  • Dormant/Inactive : {len(dormant_users)} users (0-1 txns, churn/retention candidates)")
        print(f"  • Casual           : {len(casual_users)} users (2-5 txns, recharge & send money)")
        print(f"  • Active Regular   : {len(active_users)} users (6-15 txns, bill pay & merchant QR)")
        print(f"  • Power / VIP      : {len(vip_users)} users (16-35 txns, heavy transactors)")

        now = datetime.utcnow()
        batch_size = 15000
        chunk_list = []
        total_inserted = 0

        # Cohort plan: (user_list, min_txns, max_txns, min_days_ago, max_days_ago, category_weights)
        cohort_configs = [
            # Dormant: 0 or 1 txn, recency 35-90 days ago
            (dormant_users, 0, 1, 35.0, 90.0, [0.70, 0.20, 0.05, 0.05, 0.00]),
            # Casual: 2 to 5 txns, recency 7-45 days ago
            (casual_users, 2, 5, 7.0, 45.0, [0.50, 0.25, 0.10, 0.08, 0.07]),
            # Active: 6 to 15 txns, recency 1-20 days ago
            (active_users, 6, 15, 1.0, 20.0, [0.30, 0.25, 0.20, 0.12, 0.13]),
            # VIP: 16 to 35 txns, recency 0.05-7 days ago
            (vip_users, 16, 35, 0.05, 7.0, [0.20, 0.25, 0.25, 0.15, 0.15]),
        ]

        txn_types = [
            TransactionType.RECHARGE.value,
            TransactionType.SEND_MONEY.value,
            TransactionType.MERCHANT_PAYMENT.value,
            TransactionType.CASH_OUT.value,
            TransactionType.ADD_MONEY.value,
        ]

        hour_weights = [1, 1, 1, 1, 1, 2, 3, 5, 7, 8, 9, 10, 12, 12, 10, 9, 11, 14, 16, 17, 18, 15, 10, 5]
        hours_list = list(range(24))

        for u_list, min_t, max_t, min_d, max_d, weights in cohort_configs:
            for uid in u_list:
                num_txns = random.randint(min_t, max_t) if min_t != max_t else min_t
                if num_txns == 0:
                    continue

                for _ in range(num_txns):
                    code = _generate_txn_code()
                    t_type = random.choices(txn_types, weights=weights, k=1)[0]
                    days_ago = random.uniform(min_d, max_d)
                    txn_time = now - timedelta(days=days_ago)

                    hour = random.choices(hours_list, weights=hour_weights, k=1)[0]
                    txn_time = txn_time.replace(hour=hour, minute=random.randint(0, 59), second=random.randint(0, 59))

                    sender_id = uid
                    receiver_id = None
                    merchant_id = None
                    fee = 0.00
                    operator = None

                    if t_type == TransactionType.RECHARGE.value:
                        amount = random.choice([20, 30, 50, 99, 107, 148, 199, 299, 399, 499, 799])
                        operator = random.choice(OPERATORS)
                        fee = 0.00
                        note = f"{operator} Mobile Flexiload"
                    elif t_type == TransactionType.SEND_MONEY.value:
                        amount = random.choice([200, 500, 1000, 1500, 2500, 5000, 8000, 12000])
                        receiver_id = random.choice(user_ids)
                        while receiver_id == sender_id:
                            receiver_id = random.choice(user_ids)
                        fee = 5.00 if amount > 500 else 0.00
                        note = "P2P Send Money Transfer"
                    elif t_type == TransactionType.MERCHANT_PAYMENT.value:
                        amount = round(random.uniform(150, 4500), 2)
                        merchant_id = random.choice(all_merchant_ids)
                        fee = 0.00
                        note = "Merchant QR Counter Settlement"
                    elif t_type == TransactionType.CASH_OUT.value:
                        amount = random.choice([1000, 2000, 3000, 5000, 10000, 15000, 20000])
                        receiver_id = random.choice(all_agent_ids)
                        fee = round(float(amount) * 0.0185, 2)
                        note = "Agent Point Cash Out (1.85% Fee)"
                    elif t_type == TransactionType.ADD_MONEY.value:
                        amount = random.choice([1000, 2000, 3000, 5000, 10000, 25000])
                        fee = 0.00
                        note = random.choice(["Visa Card Deposit", "Mastercard Deposit", "BRAC Bank NPSB Inbound", "City Bank Transfer"])

                    loc = random.choice(LOCATIONS)
                    dev = f"Android_{random.randint(10, 14)}_ARM64"

                    txn_row = {
                        "transaction_code": code,
                        "sender_id": sender_id,
                        "receiver_id": receiver_id,
                        "merchant_id": merchant_id,
                        "amount": amount,
                        "fee": fee,
                        "transaction_type": t_type,
                        "status": TransactionStatus.COMPLETED.value,
                        "operator": operator,
                        "recipient_phone": _generate_phone(operator) if operator else None,
                        "note": note,
                        "location": loc,
                        "device_id": dev,
                        "transaction_time": txn_time,
                        "created_at": txn_time
                    }
                    chunk_list.append(txn_row)

                    if len(chunk_list) >= batch_size:
                        db.bulk_insert_mappings(Transaction, chunk_list)
                        db.commit()
                        total_inserted += len(chunk_list)
                        print(f"  ↳ Batch committed {total_inserted} transactions...")
                        chunk_list = []

        if chunk_list:
            db.bulk_insert_mappings(Transaction, chunk_list)
            db.commit()
            total_inserted += len(chunk_list)

        # Retrain NBO Engine on the fresh realistic dataset
        print("🧠 Retraining GradientBoosting NBO & Uplift Engine on Realistic Power-Law dataset...")
        gov_info = nbo_engine.train_and_save()

        elapsed = round(time.time() - start_time, 2)
        total_txns = db.query(Transaction).count()
        total_vol = db.query(func.sum(Transaction.amount)).scalar() or 0.0
        total_fees = db.query(func.sum(Transaction.fee)).scalar() or 0.0

        print(f"✅ Power-Law seeding completed: {total_inserted} transactions inserted in {elapsed}s! Total Volume: ৳{total_vol:,.2f}")

        return {
            "success": True,
            "message": f"Successfully seeded {total_inserted} realistic Power-Law transactions across 4 cohorts in {elapsed}s.",
            "total_transactions": total_txns,
            "total_users": total_users,
            "total_volume_bdt": float(total_vol),
            "total_fees_bdt": float(total_fees),
            "cohort_breakdown": {
                "dormant_inactive_users": len(dormant_users),
                "casual_users": len(casual_users),
                "active_users": len(active_users),
                "vip_users": len(vip_users)
            },
            "elapsed_seconds": elapsed,
            "ml_governance": gov_info
        }


seed_100k_engine = Seed100kEngine()

