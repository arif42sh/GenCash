import uuid
from datetime import datetime
from typing import List, Optional, Tuple
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from fastapi import HTTPException, status

from app.models.user import User, Wallet, WalletStatus
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.models.merchant import Merchant
from app.models.system import Notification
from app.core.config import settings
from app.core.security import verify_password
from app.schemas.transaction import (
    SendMoneyRequest,
    CashOutRequest,
    MobileRechargeRequest,
    MerchantPaymentRequest,
    AddMoneyRequest,
    TransactionResponse,
)


def generate_txn_code(prefix: str = "TXN") -> str:
    timestamp = datetime.utcnow().strftime("%y%m%d%H%M")
    unique_suffix = uuid.uuid4().hex[:6].upper()
    return f"{prefix}-{timestamp}-{unique_suffix}"


class TransactionService:

    @staticmethod
    def process_send_money(
        db: Session,
        sender: User,
        request: SendMoneyRequest
    ) -> TransactionResponse:
        receiver_phone = request.receiver_phone.strip()
        amount = Decimal(str(round(request.amount, 2)))
        fee = Decimal(str(round(settings.DEFAULT_FEE_SEND_MONEY, 2)))
        total_debit = amount + fee

        # Mandatory PIN verification
        if not request.password or not verify_password(request.password, sender.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect account PIN. Please provide your valid account PIN."
            )

        # Cannot send money to oneself
        if sender.phone == receiver_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot send money to your own mobile number."
            )

        # Find receiver
        receiver = db.query(User).filter(User.phone == receiver_phone).first()
        if not receiver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Receiver account with phone {receiver_phone} is not registered on GenCash."
            )

        # Fetch wallets
        sender_wallet = db.query(Wallet).filter(Wallet.user_id == sender.id).with_for_update().first()
        receiver_wallet = db.query(Wallet).filter(Wallet.user_id == receiver.id).with_for_update().first()

        if not sender_wallet or sender_wallet.status != WalletStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sender wallet is inactive or suspended."
            )

        if not receiver_wallet or receiver_wallet.status != WalletStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Receiver wallet is inactive or frozen."
            )

        if Decimal(str(sender_wallet.balance)) < total_debit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient wallet balance. Total required: ৳{total_debit:,.2f} (Amount: ৳{amount:,.2f} + Fee: ৳{fee:,.2f}), Available: ৳{sender_wallet.balance:,.2f}"
            )

        try:
            # Atomic update
            sender_wallet.balance = round(Decimal(str(sender_wallet.balance)) - total_debit, 2)
            receiver_wallet.balance = round(Decimal(str(receiver_wallet.balance)) + amount, 2)

            txn_code = generate_txn_code("TXN-SM")
            txn = Transaction(
                transaction_code=txn_code,
                sender_id=sender.id,
                receiver_id=receiver.id,
                amount=amount,
                fee=fee,
                transaction_type=TransactionType.SEND_MONEY.value,
                status=TransactionStatus.COMPLETED.value,
                recipient_phone=receiver.phone,
                note=request.note,
                location="Dhaka, Bangladesh",
                transaction_time=datetime.utcnow()
            )
            db.add(txn)

            # Notifications
            notif_sender = Notification(
                user_id=sender.id,
                title="Send Money Successful",
                message=f"You have sent ৳{amount:,.2f} to {receiver.name} ({receiver.phone}). Fee: ৳{fee:,.2f}. TxnID: {txn_code}",
                type="TRANSACTION"
            )
            notif_receiver = Notification(
                user_id=receiver.id,
                title="Money Received",
                message=f"You received ৳{amount:,.2f} from {sender.name} ({sender.phone}). TxnID: {txn_code}",
                type="TRANSACTION"
            )
            db.add(notif_sender)
            db.add(notif_receiver)

            db.commit()
            db.refresh(txn)

            return TransactionService._format_transaction(txn, current_user_id=sender.id)
        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Transaction failed: {str(e)}"
            )

    @staticmethod
    def process_cash_out(
        db: Session,
        sender: User,
        request: CashOutRequest
    ) -> TransactionResponse:
        amount = Decimal(str(round(request.amount, 2)))
        if getattr(request, "waive_fee", False):
            fee = Decimal("0.00")
        else:
            fee_rate = Decimal(str(settings.DEFAULT_FEE_CASH_OUT_PERCENT)) / Decimal("100")
            fee = Decimal(str(round(float(amount * fee_rate), 2)))
        total_debit = amount + fee

        # Mandatory PIN verification
        if not request.password or not verify_password(request.password, sender.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect account PIN for Cash Out."
            )

        sender_wallet = db.query(Wallet).filter(Wallet.user_id == sender.id).with_for_update().first()
        if not sender_wallet or sender_wallet.status != WalletStatus.ACTIVE:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wallet is not active.")

        if Decimal(str(sender_wallet.balance)) < total_debit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient balance. Total required: ৳{total_debit:,.2f} (Withdrawal: ৳{amount:,.2f} + Fee: ৳{fee:,.2f}), Available: ৳{sender_wallet.balance:,.2f}"
            )

        try:
            sender_wallet.balance = round(Decimal(str(sender_wallet.balance)) - total_debit, 2)

            txn_code = generate_txn_code("TXN-CO")
            txn = Transaction(
                transaction_code=txn_code,
                sender_id=sender.id,
                amount=amount,
                fee=fee,
                transaction_type=TransactionType.CASH_OUT.value,
                status=TransactionStatus.COMPLETED.value,
                recipient_phone=request.agent_phone.strip(),
                note=f"Cash Out to Agent {request.agent_phone.strip()}",
                location="Dhaka, Bangladesh",
                transaction_time=datetime.utcnow()
            )
            db.add(txn)

            notif = Notification(
                user_id=sender.id,
                title="Cash Out Successful",
                message=f"Cash out of ৳{amount:,.2f} to agent {request.agent_phone} was completed. Fee: ৳{fee:,.2f}. TxnID: {txn_code}",
                type="TRANSACTION"
            )
            db.add(notif)

            db.commit()
            db.refresh(txn)

            return TransactionService._format_transaction(txn, current_user_id=sender.id)
        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Cash Out failed: {str(e)}")

    @staticmethod
    def process_mobile_recharge(
        db: Session,
        sender: User,
        request: MobileRechargeRequest
    ) -> TransactionResponse:
        amount = Decimal(str(round(request.amount, 2)))
        fee = Decimal("0.00")
        total_debit = amount + fee

        # PIN verification if provided
        if request.password and not verify_password(request.password, sender.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect account PIN for mobile recharge."
            )

        sender_wallet = db.query(Wallet).filter(Wallet.user_id == sender.id).with_for_update().first()
        if not sender_wallet or sender_wallet.status != WalletStatus.ACTIVE:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wallet is not active.")

        if Decimal(str(sender_wallet.balance)) < total_debit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient balance for mobile recharge. Available: ৳{sender_wallet.balance:,.2f}"
            )

        try:
            sender_wallet.balance = round(Decimal(str(sender_wallet.balance)) - total_debit, 2)

            txn_code = generate_txn_code("TXN-RC")
            txn = Transaction(
                transaction_code=txn_code,
                sender_id=sender.id,
                amount=amount,
                fee=fee,
                transaction_type=TransactionType.RECHARGE.value,
                status=TransactionStatus.COMPLETED.value,
                recipient_phone=request.mobile_number.strip(),
                operator=request.operator,
                note=f"Recharge ({request.operator} - {request.recharge_type})",
                location="Dhaka, Bangladesh",
                transaction_time=datetime.utcnow()
            )
            db.add(txn)

            notif = Notification(
                user_id=sender.id,
                title="Mobile Recharge Successful",
                message=f"Mobile recharge of ৳{amount:,.2f} to {request.mobile_number} ({request.operator}) completed. TxnID: {txn_code}",
                type="TRANSACTION"
            )
            db.add(notif)

            db.commit()
            db.refresh(txn)

            return TransactionService._format_transaction(txn, current_user_id=sender.id)
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Recharge failed: {str(e)}")

    @staticmethod
    def process_merchant_payment(
        db: Session,
        sender: User,
        request: MerchantPaymentRequest
    ) -> TransactionResponse:
        amount = Decimal(str(round(request.amount, 2)))
        fee = Decimal("0.00")
        total_debit = amount + fee

        # Mandatory PIN verification
        if not request.password or not verify_password(request.password, sender.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect account PIN for merchant payment."
            )

        # Find merchant
        merchant = None
        if request.merchant_id:
            merchant = db.query(Merchant).filter(Merchant.id == request.merchant_id).first()
        elif request.merchant_phone:
            merchant = db.query(Merchant).filter(Merchant.phone == request.merchant_phone.strip()).first()

        merchant_name = merchant.merchant_name if merchant else "Merchant Store"
        merchant_id = merchant.id if merchant else None

        sender_wallet = db.query(Wallet).filter(Wallet.user_id == sender.id).with_for_update().first()
        if not sender_wallet or sender_wallet.status != WalletStatus.ACTIVE:
            raise HTTPException(status_code=400, detail="Wallet is not active.")

        if Decimal(str(sender_wallet.balance)) < total_debit:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient balance. Required: ৳{total_debit:,.2f}, Available: ৳{sender_wallet.balance:,.2f}"
            )

        try:
            sender_wallet.balance = round(Decimal(str(sender_wallet.balance)) - total_debit, 2)

            if merchant:
                merchant.unsettled_balance = Decimal(str(merchant.unsettled_balance or 0.00)) + amount

            txn_code = generate_txn_code("TXN-PM")
            txn = Transaction(
                transaction_code=txn_code,
                sender_id=sender.id,
                merchant_id=merchant_id,
                amount=amount,
                fee=fee,
                transaction_type=TransactionType.MERCHANT_PAYMENT.value,
                status=TransactionStatus.COMPLETED.value,
                recipient_phone=request.merchant_phone or (merchant.phone if merchant else None),
                note=(request.note or f"Payment to {merchant_name}")[:250],
                location="Dhaka, Bangladesh",
                transaction_time=datetime.utcnow()
            )
            db.add(txn)

            notif = Notification(
                user_id=sender.id,
                title="Payment Successful",
                message=f"Payment of ৳{amount:,.2f} to {merchant_name} was successful. TxnID: {txn_code}",
                type="TRANSACTION"
            )
            db.add(notif)

            db.commit()
            db.refresh(txn)

            return TransactionService._format_transaction(txn, current_user_id=sender.id)
        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Payment failed: {str(e)}")

    @staticmethod
    def process_add_money(
        db: Session,
        user: User,
        request: AddMoneyRequest
    ) -> TransactionResponse:
        amount = Decimal(str(round(request.amount, 2)))
        wallet = db.query(Wallet).filter(Wallet.user_id == user.id).with_for_update().first()
        if not wallet or wallet.status != WalletStatus.ACTIVE:
            raise HTTPException(status_code=400, detail="Wallet is not active.")

        try:
            wallet.balance = round(Decimal(str(wallet.balance)) + amount, 2)

            txn_code = generate_txn_code("TXN-AM")
            txn = Transaction(
                transaction_code=txn_code,
                sender_id=None,
                receiver_id=user.id,
                amount=amount,
                fee=Decimal("0.00"),
                transaction_type=TransactionType.ADD_MONEY.value,
                status=TransactionStatus.COMPLETED.value,
                note=f"Added money via {request.source_bank_or_card}",
                location="Dhaka, Bangladesh",
                transaction_time=datetime.utcnow()
            )
            db.add(txn)

            notif = Notification(
                user_id=user.id,
                title="Add Money Successful",
                message=f"৳{amount:,.2f} added to your wallet via {request.source_bank_or_card}. TxnID: {txn_code}",
                type="TRANSACTION"
            )
            db.add(notif)

            db.commit()
            db.refresh(txn)

            return TransactionService._format_transaction(txn, current_user_id=user.id)
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Add money failed: {str(e)}")

    @staticmethod
    def get_user_transactions(
        db: Session,
        user_id: int,
        transaction_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[int, List[TransactionResponse]]:
        query = db.query(Transaction).filter(
            or_(Transaction.sender_id == user_id, Transaction.receiver_id == user_id)
        )

        if transaction_type and transaction_type != "ALL":
            if transaction_type in ["RECEIVED", "RECEIVE_MONEY"]:
                # Incoming money transfers where current user received funds
                query = query.filter(Transaction.receiver_id == user_id, Transaction.transaction_type != TransactionType.ADD_MONEY.value)
            elif transaction_type == "SEND_MONEY":
                # Outgoing money transfers where current user sent funds
                query = query.filter(Transaction.sender_id == user_id, Transaction.transaction_type == TransactionType.SEND_MONEY.value)
            else:
                query = query.filter(Transaction.transaction_type == transaction_type)

        total = query.count()
        txns = query.order_by(desc(Transaction.transaction_time)).offset(offset).limit(limit).all()

        formatted = [
            TransactionService._format_transaction(t, current_user_id=user_id)
            for t in txns
        ]
        return total, formatted

    @staticmethod
    def _format_transaction(txn: Transaction, current_user_id: int) -> TransactionResponse:
        is_sender = (txn.sender_id == current_user_id)
        is_receiver = (txn.receiver_id == current_user_id)

        if txn.transaction_type == TransactionType.ADD_MONEY.value:
            direction = "CREDIT"
            total = round(float(txn.amount), 2)
        elif is_sender:
            direction = "DEBIT"
            total = round(float(txn.amount + txn.fee), 2)
        elif is_receiver:
            direction = "CREDIT"
            total = round(float(txn.amount), 2)
        else:
            direction = "DEBIT"
            total = round(float(txn.amount + txn.fee), 2)

        sender_name = txn.sender.name if txn.sender else None
        sender_phone = txn.sender.phone if txn.sender else None
        receiver_name = txn.receiver.name if txn.receiver else None
        receiver_phone = txn.receiver.phone if txn.receiver else (txn.recipient_phone or None)
        merchant_name = txn.merchant.merchant_name if txn.merchant else None

        return TransactionResponse(
            id=txn.id,
            transaction_code=txn.transaction_code,
            sender_id=txn.sender_id,
            sender_name=sender_name,
            sender_phone=sender_phone,
            receiver_id=txn.receiver_id,
            receiver_name=receiver_name,
            receiver_phone=receiver_phone,
            merchant_id=txn.merchant_id,
            merchant_name=merchant_name,
            amount=round(float(txn.amount), 2),
            fee=round(float(txn.fee), 2),
            total_deducted_or_credited=total,
            direction=direction,
            transaction_type=txn.transaction_type,
            status=txn.status,
            operator=txn.operator,
            note=txn.note,
            location=txn.location,
            transaction_time=txn.transaction_time,
            created_at=txn.created_at
        )
