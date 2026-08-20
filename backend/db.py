import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")

# Note on Supabase POOLER host connections:
# - Port 6543 is pgbouncer transaction mode and needs prepared statements disabled.
# - Port 5432 is session mode and works as-is.

engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool
)
