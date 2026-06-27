import os
import logging
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    Client = type('Client', (object,), {})  # Dummy class for type hinting

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

supabase_client: Client | None = None

def init_supabase() -> Client | None:
    """
    Initializes the Supabase client safely.
    If environment variables are missing, it logs an error instead of crashing.
    """
    global supabase_client
    if supabase_client is not None:
        return supabase_client

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")

    if not SUPABASE_AVAILABLE:
        logger.error(
            "Supabase library is not installed. Database features will be disabled. "
            "Please install it using 'pip install supabase'."
        )
        return None

    if not url or not key:
        logger.error(
            "SUPABASE_URL or SUPABASE_KEY is missing from environment variables. "
            "Database features will be disabled. The application will continue to run "
            "using fallback mechanisms (e.g., local storage or limited functionality)."
        )
        return None

    try:
        supabase_client = create_client(url, key)
        logger.info("Supabase client initialized successfully.")
        return supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None

# Initialize on module import
init_supabase()
