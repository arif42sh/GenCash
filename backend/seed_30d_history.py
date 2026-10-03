import random
from datetime import datetime, timedelta
from decimal import Decimal
from app.core.database import SessionLocal
from app.models.transaction import Transaction, TransactionType, TransactionStatus

def seed_30_days_history():
    db = SessionLocal()
    try:
        print("🌱 Seeding realistic 30-day transaction history for User 1, 2, and 3 in MySQL gencash_db...")
        
        # User configurations
        # User 1: Arif Shahriar / Tanvir (Active Urban Youth/Pro - High recharge & dining)
        # User 2: Sadia Rahman (Family Head - Grocery & Bill Pay)
        # User 3: Rafiqul Islam (Student Youth - Mobile data & recharge)
        
        users_config = [
            {"user_id": 1, "phone": "01711111111", "op": "Grameenphone", "recipient": "01822222222"},
            {"user_id": 2, "phone": "01822222222", "op": "Robi", "recipient": "01711111111"},
            {"user_id": 3, "phone": "01933333333", "op": "Banglalink", "recipient": "01711111111"},
        ]

        now = datetime.utcnow()
        new_txns = []

        for user in users_config:
            uid = user["user_id"]
            uphone = user["phone"]
            default_op = user["op"]
            partner_phone = user["recipient"]

            # We generate 1 to 2 transactions per day across the 30 days
            for day in range(1, 31):
                txn_date = now - timedelta(days=day, hours=random.randint(1, 14), minutes=random.randint(5, 55))
                
                # Determine transaction type based on day cycle
                # Recharges happen every 3-4 days
                if day % 4 == 0 or day in [2, 7, 12, 18, 24, 29]:
                    amt = random.choice([49.0, 108.0, 249.0, 399.0, 499.0, 799.0])
                    code = f"TXN-RC-{txn_date.strftime('%y%m%d')}-{random.randint(1000, 9999)}"
                    t = Transaction(
                        transaction_code=code,
                        sender_id=uid,
                        receiver_id=None,
                        merchant_id=None,
                        amount=Decimal(str(amt)),
                        fee=Decimal("0.00"),
                        transaction_type=TransactionType.RECHARGE.value,
                        status=TransactionStatus.COMPLETED.value,
                        recipient_phone=uphone,
                        operator=default_op,
                        note=f"Mobile Recharge ({default_op} - PREPAID)",
                        location="Dhaka, Bangladesh",
                        transaction_time=txn_date,
                        created_at=txn_date,
                    )
                    new_txns.append(t)

                # Food / Dining payments at Chillox / Retail on weekends & evenings
                if day % 5 == 1 or day in [5, 11, 19, 26]:
                    amt = round(random.uniform(320.0, 1250.0), 2)
                    code = f"TXN-PM-{txn_date.strftime('%y%m%d')}-{random.randint(1000, 9999)}"
                    t = Transaction(
                        transaction_code=code,
                        sender_id=uid,
                        receiver_id=None,
                        merchant_id=3, # Chillox Burger Hub
                        amount=Decimal(str(amt)),
                        fee=Decimal("0.00"),
                        transaction_type=TransactionType.MERCHANT_PAYMENT.value,
                        status=TransactionStatus.COMPLETED.value,
                        recipient_phone="01700100003",
                        operator=None,
                        note="Dining & Burger at Chillox",
                        location="Banani, Dhaka",
                        transaction_time=txn_date,
                        created_at=txn_date,
                    )
                    new_txns.append(t)

                # Grocery & Superstore at Shwapno / Unimart
                if day in [3, 10, 17, 25]:
                    amt = round(random.uniform(850.0, 3400.0), 2)
                    code = f"TXN-PM-{txn_date.strftime('%y%m%d')}-{random.randint(1000, 9999)}"
                    t = Transaction(
                        transaction_code=code,
                        sender_id=uid,
                        receiver_id=None,
                        merchant_id=1, # Shwapno
                        amount=Decimal(str(amt)),
                        fee=Decimal("0.00"),
                        transaction_type=TransactionType.MERCHANT_PAYMENT.value,
                        status=TransactionStatus.COMPLETED.value,
                        recipient_phone="01700100001",
                        operator=None,
                        note="Grocery purchase at Shwapno Superstore",
                        location="Dhanmondi, Dhaka",
                        transaction_time=txn_date,
                        created_at=txn_date,
                    )
                    new_txns.append(t)

                # Utility Bill Pay (Electricity / DESCO / WASA) once or twice a month
                if day in [8, 22]:
                    amt = round(random.uniform(1400.0, 2800.0), 2)
                    code = f"TXN-BP-{txn_date.strftime('%y%m%d')}-{random.randint(1000, 9999)}"
                    t = Transaction(
                        transaction_code=code,
                        sender_id=uid,
                        receiver_id=None,
                        merchant_id=None,
                        amount=Decimal(str(amt)),
                        fee=Decimal("0.00"),
                        transaction_type=TransactionType.BILL_PAYMENT.value,
                        status=TransactionStatus.COMPLETED.value,
                        recipient_phone="DESCO-7721094",
                        operator=None,
                        note="Electricity Bill Payment (DESCO)",
                        location="Dhaka, Bangladesh",
                        transaction_time=txn_date,
                        created_at=txn_date,
                    )
                    new_txns.append(t)

                # Send Money to friends & family
                if day in [4, 14, 21, 28]:
                    amt = round(random.uniform(500.0, 2000.0), 2)
                    code = f"TXN-SM-{txn_date.strftime('%y%m%d')}-{random.randint(1000, 9999)}"
                    t = Transaction(
                        transaction_code=code,
                        sender_id=uid,
                        receiver_id=2 if uid != 2 else 1,
                        merchant_id=None,
                        amount=Decimal(str(amt)),
                        fee=Decimal("5.00"),
                        transaction_type=TransactionType.SEND_MONEY.value,
                        status=TransactionStatus.COMPLETED.value,
                        recipient_phone=partner_phone,
                        operator=None,
                        note="Personal transfer / Shared expense",
                        location="Dhaka, Bangladesh",
                        transaction_time=txn_date,
                        created_at=txn_date,
                    )
                    new_txns.append(t)

                # Add Money from Bank
                if day in [1, 15]:
                    amt = round(random.uniform(3000.0, 10000.0), 2)
                    code = f"TXN-AM-{txn_date.strftime('%y%m%d')}-{random.randint(1000, 9999)}"
                    t = Transaction(
                        transaction_code=code,
                        sender_id=None,
                        receiver_id=uid,
                        merchant_id=None,
                        amount=Decimal(str(amt)),
                        fee=Decimal("0.00"),
                        transaction_type=TransactionType.ADD_MONEY.value,
                        status=TransactionStatus.COMPLETED.value,
                        recipient_phone=uphone,
                        operator=None,
                        note="Add Money from City Bank (Visa)",
                        location="Online Banking",
                        transaction_time=txn_date,
                        created_at=txn_date,
                    )
                    new_txns.append(t)

        db.add_all(new_txns)
        db.commit()
        print(f"✅ Successfully inserted {len(new_txns)} realistic transactions across a full 30-day timeline into MySQL gencash_db!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding 30d history: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_30_days_history()
