import logging
import pymysql
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger("gencash.database")
logging.basicConfig(level=logging.INFO)

Base = declarative_base()


def init_mysql_database():
    """Ensure that the MySQL database exists before SQLAlchemy tries to connect."""
    try:
        connection = pymysql.connect(
            host=settings.DB_HOST,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            port=settings.DB_PORT,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    f"CREATE DATABASE IF NOT EXISTS `{settings.DB_NAME}` "
                    f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
                )
            connection.commit()
            logger.info(f"Database `{settings.DB_NAME}` initialized or verified in MySQL.")
            return True
        finally:
            connection.close()
    except Exception as e:
        logger.warning(f"Could not initialize MySQL database directly: {e}")
        return False


def get_engine():
    """Build engine with MySQL or SQLite fallback."""
    mysql_ready = init_mysql_database()
    if mysql_ready:
        try:
            engine = create_engine(
                settings.SQLALCHEMY_DATABASE_URI,
                pool_pre_ping=True,
                pool_recycle=3600,
                echo=False
            )
            # Test connection
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info(f"Connected successfully to MySQL at {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}")
            return engine
        except Exception as e:
            logger.error(f"MySQL connection error: {e}")

    if settings.USE_SQLITE_FALLBACK:
        logger.warning("Falling back to local SQLite database (gencash_dev.db)...")
        sqlite_uri = "sqlite:///./gencash_dev.db"
        return create_engine(
            sqlite_uri,
            connect_args={"check_same_thread": False},
            echo=False
        )
    else:
        raise RuntimeError("Failed to connect to MySQL database and SQLite fallback is disabled.")


engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency for yielding database session with automatic cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
