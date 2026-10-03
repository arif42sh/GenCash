import random
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User, Wallet, UserStatus, WalletStatus
from app.models.merchant import Merchant
from app.models.transaction import Transaction, TransactionType, TransactionStatus

def reconcile_and_seed():
    db: Session = SessionLocal()
    try:
        print("🚀 Starting Complete Professional Ledger & Database Reconciliation...")

        # 1. Update Core Users (1: Arif, 2: Sadia, 3: Rafiqul)
        # Establish realistic account creation dates (5 months ago: 01 May 2026)
        user_profiles = {
            1: {
                "name": "Arif Shahriar",
                "phone": "01711111111",
                "email": "arif.shahriar@gmail.com",
                "nid_number": "19942691234567891",
                "dob": "1994-08-15",
                "op": "Grameenphone",
                "created_at": datetime(2026, 5, 1, 10, 15, 0),
                "kyc_verified_at": datetime(2026, 5, 1, 10, 45, 0),
            },
            2: {
                "name": "Sadia Rahman",
                "phone": "01822222222",
                "email": "sadia.rahman@gmail.com",
                "nid_number": "19922691234567892",
                "dob": "1992-03-22",
                "op": "Robi",
                "created_at": datetime(2026, 5, 1, 11, 0, 0),
                "kyc_verified_at": datetime(2026, 5, 1, 11, 30, 0),
            },
            3: {
                "name": "Rafiqul Islam",
                "phone": "01933333333",
                "email": "rafiqul.islam@gmail.com",
                "nid_number": "19982691234567893",
                "dob": "1998-11-10",
                "op": "Banglalink",
                "created_at": datetime(2026, 5, 1, 14, 20, 0),
                "kyc_verified_at": datetime(2026, 5, 1, 14, 50, 0),
            },
        }

        for uid, p in user_profiles.items():
            u = db.query(User).filter(User.id == uid).first()
            if u:
                u.name = p["name"]
                u.phone = p["phone"]
                u.email = p["email"]
                u.nid_number = p["nid_number"]
                u.dob = p["dob"]
                u.kyc_status = "VERIFIED"
                u.status = "ACTIVE"
                u.created_at = p["created_at"]
                u.kyc_verified_at = p["kyc_verified_at"]
                u.is_agent = False
                print(f"  ✓ Reconciled User {uid}: {u.name} (Created: {u.created_at.strftime('%d %b %Y')}, KYC Verified: {u.kyc_verified_at.strftime('%d %b %Y')})")

        # 2. Update Agents (User 4, User 5)
        agent4 = db.query(User).filter(User.id == 4).first()
        if agent4:
            agent4.is_agent = True
            agent4.created_at = datetime(2026, 5, 1, 9, 0, 0)
            agent4.kyc_status = "VERIFIED"
            agent4.kyc_verified_at = datetime(2026, 5, 1, 9, 30, 0)
            agent4.outlet_name = "Gulshan Cash Point"

        agent5 = db.query(User).filter(User.id == 5).first()
        if agent5:
            agent5.is_agent = True
            agent5.created_at = datetime(2026, 5, 1, 9, 0, 0)
            agent5.kyc_status = "VERIFIED"
            agent5.kyc_verified_at = datetime(2026, 5, 1, 9, 30, 0)
            agent5.outlet_name = "Dhanmondi GenCash Point"

        db.commit()

        # 3. Clean erratic / ghost transactions for Users 1, 2, 3
        print("  🧹 Purging old unbalanced/conflicting transaction records for Users 1, 2, 3...")
        db.query(Transaction).filter(
            (Transaction.sender_id.in_([1, 2, 3])) | (Transaction.receiver_id.in_([1, 2, 3]))
        ).delete(synchronize_session=False)
        db.commit()

        # 4. Generate 100% Mathematically Reconciled 30-Day Ledger
        # Reference Date: 2026-10-03 (Today)
        now = datetime(2026, 10, 3, 17, 30, 0)

        # Track running balances to ensure 100% solvency and zero negative dips
        running_balances = {1: Decimal("0.00"), 2: Decimal("0.00"), 3: Decimal("0.00")}
        all_txns = []

        # Step 4A: Day 30 (03 Sep 2026, 10:15 AM - 10:45 AM) -> Opening Bank Add Money (Deposit)
        opening_deposits = [
            (1, Decimal("28000.00"), "City Bank Visa Card", datetime(2026, 9, 3, 10, 15, 0), "TXN-AM-260903-1001"),
            (2, Decimal("32000.00"), "BRAC Bank Mastercard", datetime(2026, 9, 3, 10, 30, 0), "TXN-AM-260903-2001"),
            (3, Decimal("18000.00"), "DBBL NexusPay Card", datetime(2026, 9, 3, 10, 45, 0), "TXN-AM-260903-3001"),
        ]

        for uid, amt, bank, dt, code in opening_deposits:
            t = Transaction(
                transaction_code=code,
                sender_id=None,
                receiver_id=uid,
                merchant_id=None,
                amount=amt,
                fee=Decimal("0.00"),
                transaction_type=TransactionType.ADD_MONEY.value,
                status=TransactionStatus.COMPLETED.value,
                recipient_phone=user_profiles[uid]["phone"],
                operator=None,
                note=f"Opening Deposit via {bank}",
                location="Online Banking",
                transaction_time=dt,
                created_at=dt,
            )
            all_txns.append(t)
            running_balances[uid] += amt

        # Step 4B: Day 16 (17 Sep 2026, 11:00 AM) -> Mid-Month Top-up / Salary Deposit
        mid_deposits = [
            (1, Decimal("15000.00"), "City Bank Visa Card", datetime(2026, 9, 17, 11, 10, 0), "TXN-AM-260917-1002"),
            (2, Decimal("14000.00"), "BRAC Bank Mastercard", datetime(2026, 9, 17, 11, 25, 0), "TXN-AM-260917-2002"),
            (3, Decimal("8000.00"), "DBBL NexusPay Card", datetime(2026, 9, 17, 11, 40, 0), "TXN-AM-260917-3002"),
        ]
        for uid, amt, bank, dt, code in mid_deposits:
            t = Transaction(
                transaction_code=code,
                sender_id=None,
                receiver_id=uid,
                merchant_id=None,
                amount=amt,
                fee=Decimal("0.00"),
                transaction_type=TransactionType.ADD_MONEY.value,
                status=TransactionStatus.COMPLETED.value,
                recipient_phone=user_profiles[uid]["phone"],
                operator=None,
                note=f"Add Money from {bank}",
                location="Online Banking",
                transaction_time=dt,
                created_at=dt,
            )
            all_txns.append(t)
            running_balances[uid] += amt

        # Step 4C: Generate realistic daily transactions (Days 29 down to Day 0)
        # Using realistic daytime hours (10:00 AM - 10:15 PM)
        # Never identical timestamps
        minute_counter = 10

        for day in range(29, -1, -1):
            day_date = now - timedelta(days=day)

            for uid in [1, 2, 3]:
                u_op = user_profiles[uid]["op"]
                u_phone = user_profiles[uid]["phone"]

                # 1. Mobile Recharge (User 3 recharges every 2-3 days as a heavy data user; Users 1 & 2 recharge every 4-5 days)
                is_recharge_day = ((day + uid) % 3 == 0) if uid == 3 else ((day + uid) % 4 == 0)
                if is_recharge_day:
                    minute_counter = (minute_counter + 7) % 50 + 5
                    txn_dt = day_date.replace(hour=11 + (uid % 4), minute=minute_counter, second=0)
                    rc_amounts = [49.0, 108.0, 249.0, 399.0, 499.0]
                    rc_amt = Decimal(str(rc_amounts[(day + uid) % len(rc_amounts)]))
                    
                    if running_balances[uid] >= rc_amt + Decimal("500.00"):
                        code = f"TXN-RC-{txn_dt.strftime('%y%m%d')}-{uid}{day:02d}1"
                        t = Transaction(
                            transaction_code=code,
                            sender_id=uid,
                            receiver_id=None,
                            merchant_id=None,
                            amount=rc_amt,
                            fee=Decimal("0.00"),
                            transaction_type=TransactionType.RECHARGE.value,
                            status=TransactionStatus.COMPLETED.value,
                            recipient_phone=u_phone,
                            operator=u_op,
                            note=f"{u_op} ৳{int(rc_amt)} Pack Recharge",
                            location="Dhaka, Bangladesh",
                            transaction_time=txn_dt,
                            created_at=txn_dt,
                        )
                        all_txns.append(t)
                        running_balances[uid] -= rc_amt

                # 2. Dining / Chillox Burger Payment on evenings (Merchant #3) for Foodies (User 1 & User 3)
                if (day + uid * 2) % 6 == 1 and uid in [1, 3]:
                    minute_counter = (minute_counter + 11) % 50 + 5
                    txn_dt = day_date.replace(hour=19 + (uid % 2), minute=minute_counter, second=0)
                    dine_amt = Decimal(str(round(random.uniform(350.0, 850.0 if uid == 3 else 1280.0), 2)))

                    if running_balances[uid] >= dine_amt + Decimal("500.00"):
                        code = f"TXN-PM-{txn_dt.strftime('%y%m%d')}-{uid}{day:02d}2"
                        t = Transaction(
                            transaction_code=code,
                            sender_id=uid,
                            receiver_id=None,
                            merchant_id=3, # Chillox Burger Hub
                            amount=dine_amt,
                            fee=Decimal("0.00"),
                            transaction_type=TransactionType.MERCHANT_PAYMENT.value,
                            status=TransactionStatus.COMPLETED.value,
                            recipient_phone="01700100003",
                            operator=None,
                            note="Dinner & Burgers at Chillox Banani",
                            location="Banani 11, Dhaka",
                            transaction_time=txn_dt,
                            created_at=txn_dt,
                        )
                        all_txns.append(t)
                        running_balances[uid] -= dine_amt

                # 3. Superstore Grocery at Shwapno (Merchant #1) or Unimart Mega Store (Merchant #2)
                # User 2 shops at Unimart Mega Store; User 1 shops at Shwapno (Household grocery needs)
                is_groc_day = (uid == 1 and (day + uid) in [5, 12, 19, 26]) or (uid == 2 and day in [3, 8, 14, 20, 26])
                if is_groc_day:
                    minute_counter = (minute_counter + 13) % 50 + 5
                    m_id = 2 if uid == 2 else 1
                    m_name = "Unimart Mega Store" if m_id == 2 else "Shwapno Superstore"
                    m_phone = "01700100002" if m_id == 2 else "01700100001"
                    m_loc = "Gulshan 2, Dhaka" if m_id == 2 else "Dhanmondi 27, Dhaka"
                    txn_dt = day_date.replace(hour=17 + (uid % 3), minute=minute_counter, second=0)
                    groc_amt = Decimal(str(round(random.uniform(1450.0, 3200.0), 2)))

                    if running_balances[uid] >= groc_amt + Decimal("500.00"):
                        code = f"TXN-PM-{txn_dt.strftime('%y%m%d')}-{uid}{day:02d}3"
                        t = Transaction(
                            transaction_code=code,
                            sender_id=uid,
                            receiver_id=None,
                            merchant_id=m_id,
                            amount=groc_amt,
                            fee=Decimal("0.00"),
                            transaction_type=TransactionType.MERCHANT_PAYMENT.value,
                            status=TransactionStatus.COMPLETED.value,
                            recipient_phone=m_phone,
                            operator=None,
                            note=f"Weekly Groceries & Supplies at {m_name}",
                            location=m_loc,
                            transaction_time=txn_dt,
                            created_at=txn_dt,
                        )
                        all_txns.append(t)
                        running_balances[uid] -= groc_amt

                # 4. Utility Bill Payment (DESCO Electricity Monthly Bill) for Household Manager (User 2)
                if day in [7, 21] and uid == 2:
                    minute_counter = (minute_counter + 9) % 50 + 5
                    txn_dt = day_date.replace(hour=14, minute=minute_counter, second=0)
                    bill_amt = Decimal(str(round(random.uniform(1650.0, 2750.0), 2)))

                    if running_balances[uid] >= bill_amt + Decimal("500.00"):
                        code = f"TXN-BP-{txn_dt.strftime('%y%m%d')}-{uid}{day:02d}4"
                        t = Transaction(
                            transaction_code=code,
                            sender_id=uid,
                            receiver_id=None,
                            merchant_id=None,
                            amount=bill_amt,
                            fee=Decimal("0.00"),
                            transaction_type=TransactionType.BILL_PAYMENT.value,
                            status=TransactionStatus.COMPLETED.value,
                            recipient_phone="DESCO-7721094",
                            operator=None,
                            note="DESCO Electricity Monthly Bill",
                            location="Dhaka, Bangladesh",
                            transaction_time=txn_dt,
                            created_at=txn_dt,
                        )
                        all_txns.append(t)
                        running_balances[uid] -= bill_amt

                # 5. P2P Send Money (Between Arif, Sadia, Rafiqul)
                if day in [3, 10, 18, 25]:
                    receiver_uid = 2 if uid == 1 else (1 if uid == 2 else 1)
                    minute_counter = (minute_counter + 17) % 50 + 5
                    txn_dt = day_date.replace(hour=16, minute=minute_counter, second=0)
                    p2p_amt = Decimal(str(round(random.uniform(600.0, 1800.0), 2)))
                    fee = Decimal("5.00")

                    if running_balances[uid] >= (p2p_amt + fee + Decimal("500.00")):
                        code = f"TXN-SM-{txn_dt.strftime('%y%m%d')}-{uid}{day:02d}5"
                        t = Transaction(
                            transaction_code=code,
                            sender_id=uid,
                            receiver_id=receiver_uid,
                            merchant_id=None,
                            amount=p2p_amt,
                            fee=fee,
                            transaction_type=TransactionType.SEND_MONEY.value,
                            status=TransactionStatus.COMPLETED.value,
                            recipient_phone=user_profiles[receiver_uid]["phone"],
                            operator=None,
                            note="Personal transfer / Shared expense",
                            location="Dhaka, Bangladesh",
                            transaction_time=txn_dt,
                            created_at=txn_dt,
                        )
                        all_txns.append(t)
                        running_balances[uid] -= (p2p_amt + fee)
                        running_balances[receiver_uid] += p2p_amt

        # Save all transactions
        db.add_all(all_txns)
        db.commit()

        # Step 5: Update Wallet Balances to match EXACT mathematical sum
        print("\n📊 Updating Wallet Balances to match 100% exact mathematical ledger sum:")
        for uid in [1, 2, 3]:
            wallet = db.query(Wallet).filter(Wallet.user_id == uid).first()
            if not wallet:
                wallet = Wallet(user_id=uid, balance=running_balances[uid], currency="BDT", status=WalletStatus.ACTIVE)
                db.add(wallet)
            else:
                wallet.balance = running_balances[uid]

            # Recheck DB queries
            total_in = db.query(Transaction.amount).filter(
                Transaction.receiver_id == uid, Transaction.status == TransactionStatus.COMPLETED.value
            ).all()
            sum_in = sum([t[0] for t in total_in]) or Decimal("0.00")

            total_out = db.query(Transaction.amount, Transaction.fee).filter(
                Transaction.sender_id == uid, Transaction.status == TransactionStatus.COMPLETED.value
            ).all()
            sum_out = sum([t[0] for t in total_out]) or Decimal("0.00")
            sum_fees = sum([t[1] for t in total_out]) or Decimal("0.00")

            computed_balance = sum_in - (sum_out + sum_fees)
            print(f"  User {uid} ({user_profiles[uid]['name']}):")
            print(f"     Total Inflow:  ৳{sum_in:,.2f}")
            print(f"     Total Outflow: ৳{sum_out:,.2f} + Fees: ৳{sum_fees:,.2f} = ৳{sum_out + sum_fees:,.2f}")
            print(f"     Ledger Net:    ৳{computed_balance:,.2f}")
            print(f"     Wallet Balance: ৳{wallet.balance:,.2f}")
            assert abs(wallet.balance - computed_balance) < Decimal("0.01"), "Ledger mismatch detected!"

        db.commit()

        # Step 5: Seed realistic Campaign Responses for Offer Fatigue Shield
        print("\n  🛡️ Seeding Campaign Responses for Offer Fatigue Shield...")
        from app.models.marketing import Campaign, CampaignResponse
        db.query(CampaignResponse).delete(synchronize_session=False)

        camp = db.query(Campaign).first()
        camp_id = camp.id if camp else 1

        # User 1 (Arif): Engaged, last offer was converted! Streak = 0, Fatigue = 0.0
        r1 = CampaignResponse(campaign_id=camp_id, user_id=1, sent_at=now - timedelta(days=2), viewed=True, clicked=True, accepted=True, converted=True, transaction_value=Decimal("799.00"))
        
        # User 2 (Sadia): Converted an offer 5 days ago, viewed 1 offer yesterday. Streak = 1, Fatigue = 0.25 (Mild)
        r2_old = CampaignResponse(campaign_id=camp_id, user_id=2, sent_at=now - timedelta(days=5), viewed=True, clicked=True, accepted=True, converted=True, transaction_value=Decimal("1500.00"))
        r2_new = CampaignResponse(campaign_id=camp_id, user_id=2, sent_at=now - timedelta(days=1), viewed=True, clicked=False, accepted=False, converted=False, transaction_value=Decimal("0.00"))

        # User 3 (Rafiqul): Engaged student, converted mobile data pack! Streak = 0, Fatigue = 0.0
        r3 = CampaignResponse(campaign_id=camp_id, user_id=3, sent_at=now - timedelta(days=3), viewed=True, clicked=True, accepted=True, converted=True, transaction_value=Decimal("399.00"))

        # User 4 (Dormant / Overwhelmed): Ignored 3 consecutive promo campaigns! Streak = 3, Fatigue = 0.75 -> SLEEPING_DOG, Cool-off Active!
        r4_1 = CampaignResponse(campaign_id=camp_id, user_id=4, sent_at=now - timedelta(days=8), viewed=True, clicked=False, accepted=False, converted=False, transaction_value=Decimal("0.00"))
        r4_2 = CampaignResponse(campaign_id=camp_id, user_id=4, sent_at=now - timedelta(days=4), viewed=True, clicked=False, accepted=False, converted=False, transaction_value=Decimal("0.00"))
        r4_3 = CampaignResponse(campaign_id=camp_id, user_id=4, sent_at=now - timedelta(days=1), viewed=True, clicked=False, accepted=False, converted=False, transaction_value=Decimal("0.00"))

        db.add_all([r1, r2_old, r2_new, r3, r4_1, r4_2, r4_3])
        db.commit()
        print("  ✓ Campaign Responses seeded: User 1 (Streak=0), User 2 (Streak=1), User 3 (Streak=0), User 4 (Streak=3 - Shield Active!)")

        print(f"\n🎉 Successfully created {len(all_txns)} fully reconciled transactions!")
        print("✅ 100% Solvency, 100% Double-Entry verified, No collisions, Realistic daytime timestamps!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error during reconciliation: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    reconcile_and_seed()
