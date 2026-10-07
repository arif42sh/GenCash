import logging
from datetime import datetime, date, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User, Wallet, AdminUser, UserStatus, WalletStatus, AdminRole
from app.models.merchant import MerchantCategory, Merchant
from app.models.marketing import Offer, Campaign, CampaignResponse
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.models.ai import AIInsight
from app.models.system import Notification

logger = logging.getLogger("gencash.seed")


def seed_initial_data(db: Session):
    """Seed comprehensive initial data if database is fresh."""
    try:
        # Check if users already exist
        if db.query(User).first():
            logger.info("Database already seeded. Skipping initial data seed.")
            return

        logger.info("Seeding initial database records for GenCash...")

        # 1. Admin Users
        admin = AdminUser(
            name="Platform Super Admin",
            email="admin@gencash.com",
            password_hash=get_password_hash("admin123456"),
            role=AdminRole.SUPER_ADMIN,
            status="ACTIVE"
        )
        db.add(admin)

        # 2. Merchant Categories
        categories_data = [
            ("Grocery & Superstores", "Everyday groceries, supermarket chains", "cart"),
            ("Food & Restaurants", "Cafes, dine-in, fast food outlets", "restaurant"),
            ("Electronics & Tech", "Gadgets, computer hardware, electronics", "laptop"),
            ("Fashion & Apparel", "Clothing, shoes, lifestyle brands", "shirt"),
            ("Healthcare & Pharmacy", "Hospitals, medical diagnostics, pharma", "medkit"),
            ("Transport & Travel", "Rides, tickets, airlines, fuel", "bus"),
            ("Education & Courses", "Tuition fees, coaching, university", "school"),
            ("Entertainment", "Cinema, streaming, gaming", "film"),
        ]
        cat_objs = []
        for name, desc, icon in categories_data:
            cat = MerchantCategory(name=name, description=desc, icon=icon, status="ACTIVE")
            db.add(cat)
            cat_objs.append(cat)
        db.flush()

        # 3. Merchants
        merchants_data = [
            ("Shwapno Superstore", cat_objs[0].id, "01700100001", "Dhanmondi 27, Dhaka"),
            ("Unimart Mega Store", cat_objs[0].id, "01700100002", "Gulshan 2, Dhaka"),
            ("Chillox Burger Hub", cat_objs[1].id, "01700100003", "Banani 11, Dhaka"),
            ("Star Tech Ltd", cat_objs[2].id, "01700100004", "Multiplan Center, Dhaka"),
            ("Apex Footwear", cat_objs[3].id, "01700100005", "Bashundhara City, Dhaka"),
            ("Labaid Diagnostic", cat_objs[4].id, "01700100006", "Dhanmondi, Dhaka"),
        ]
        merchant_objs = []
        for m_name, c_id, m_phone, m_loc in merchants_data:
            m = Merchant(
                merchant_name=m_name,
                category_id=c_id,
                phone=m_phone,
                location=m_loc,
                status="ACTIVE"
            )
            db.add(m)
            merchant_objs.append(m)
        db.flush()

        # 4. Demo Customer Users
        users_info = [
            ("Arif Shahriar", "01711111111", "arif@gencash.com", "123456", 12500.00),
            ("Sadia Rahman", "01822222222", "sadia@example.com", "123456", 8200.00),
            ("Rafiqul Islam", "01933333333", "rafiq@example.com", "123456", 4500.00),
            ("Demo Cash Agent", "01799999999", "agent@gencash.com", "123456", 50000.00),
        ]
        created_users = []
        for name, phone, email, pwd, balance in users_info:
            u = User(
                name=name,
                phone=phone,
                email=email,
                password_hash=get_password_hash(pwd),
                status=UserStatus.ACTIVE
            )
            db.add(u)
            db.flush()

            w = Wallet(
                user_id=u.id,
                balance=Decimal(str(balance)),
                currency="BDT",
                status=WalletStatus.ACTIVE
            )
            db.add(w)

            n = Notification(
                user_id=u.id,
                title="Welcome to GenCash MFS",
                message=f"Hello {name}, your digital wallet is ready with ৳{balance:,.2f} demo balance.",
                type="SYSTEM",
                is_read=False
            )
            db.add(n)
            created_users.append(u)

        db.flush()
        u_tanvir, u_sadia, u_rafiq, u_agent = created_users

        # 5. Offers
        offers_data = [
            ("10% Mobile Recharge Cashback", "Get 10% instant cashback up to ৳50 on any mobile recharge above ৳100.", "CASHBACK", 50.0, 100.0),
            ("৳100 Cashback on Superstores", "Shop at Shwapno or Unimart with GenCash and get ৳100 cashback on min ৳1000 order.", "CASHBACK", 100.0, 1000.0),
            ("Send Money Zero Fee Promo", "Enjoy 0 service fee on your next 5 Send Money transfers to friends & family.", "DISCOUNT", 5.0, 500.0),
        ]
        offer_objs = []
        for title, desc, o_type, disc, min_t in offers_data:
            off = Offer(
                title=title,
                description=desc,
                offer_type=o_type,
                discount_value=Decimal(str(disc)),
                minimum_transaction=Decimal(str(min_t)),
                start_date=date.today() - timedelta(days=5),
                end_date=date.today() + timedelta(days=25),
                status="ACTIVE"
            )
            db.add(off)
            offer_objs.append(off)
        db.flush()

        # 6. Sample Transactions for Tanvir (User 1)
        sample_txns = [
            (
                "TXN-AM-260901-81A",
                None,
                u_tanvir.id,
                None,
                Decimal("15000.00"),
                Decimal("0.00"),
                TransactionType.ADD_MONEY.value,
                "Bank Transfer via BRAC Bank",
                datetime.utcnow() - timedelta(days=4)
            ),
            (
                "TXN-SM-260902-92B",
                u_tanvir.id,
                u_sadia.id,
                None,
                Decimal("1200.00"),
                Decimal("5.00"),
                TransactionType.SEND_MONEY.value,
                "Project contribution",
                datetime.utcnow() - timedelta(days=3)
            ),
            (
                "TXN-RC-260903-73C",
                u_tanvir.id,
                None,
                None,
                Decimal("200.00"),
                Decimal("0.00"),
                TransactionType.RECHARGE.value,
                "Recharge (Grameenphone - PREPAID)",
                datetime.utcnow() - timedelta(days=2)
            ),
            (
                "TXN-PM-260904-44D",
                u_tanvir.id,
                None,
                merchant_objs[0].id,
                Decimal("1100.00"),
                Decimal("0.00"),
                TransactionType.MERCHANT_PAYMENT.value,
                "Grocery items at Shwapno",
                datetime.utcnow() - timedelta(days=1)
            ),
        ]

        for code, s_id, r_id, m_id, amt, fee, t_type, note, t_time in sample_txns:
            txn = Transaction(
                transaction_code=code,
                sender_id=s_id,
                receiver_id=r_id,
                merchant_id=m_id,
                amount=amt,
                fee=fee,
                transaction_type=t_type,
                status=TransactionStatus.COMPLETED.value,
                recipient_phone="01822222222" if t_type == TransactionType.SEND_MONEY.value else "01711111111",
                operator="Grameenphone" if t_type == TransactionType.RECHARGE.value else None,
                note=note,
                location="Dhaka, Bangladesh",
                transaction_time=t_time
            )
            db.add(txn)

        # 7. AI Insights for User 1 (SRS pages 10 & 15)
        ai_insights_data = [
            (
                u_tanvir.id,
                "SPENDING_ANOMALY",
                "High dining and entertainment spending detected this week.",
                Decimal("0.8700"),
                "Dining and merchant transactions increased by 31% compared with your monthly baseline.",
                "v1.2-anomaly"
            ),
            (
                u_tanvir.id,
                "NEXT_BEST_OFFER",
                "Recommended Offer: Recharge Cashback 15%",
                Decimal("0.9200"),
                "User exhibits frequent prepaid recharge patterns on Friday evenings. Low response fatigue.",
                "v1.4-ranker"
            ),
            (
                u_tanvir.id,
                "BUDGET_PREDICTION",
                "Expected spending this week: ৳4,250",
                Decimal("0.8400"),
                "Calculated based on 30-day moving average and recurring grocery expenditure trends.",
                "v1.1-forecast"
            ),
        ]

        for uid, itype, pred, conf, expl, mver in ai_insights_data:
            ai_i = AIInsight(
                user_id=uid,
                entity_type="USER",
                entity_id=uid,
                insight_type=itype,
                prediction=pred,
                confidence=conf,
                explanation=expl,
                model_version=mver,
                created_at=datetime.utcnow()
            )
            db.add(ai_i)

        db.commit()
        logger.info("Database successfully seeded with realistic MFS records!")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
