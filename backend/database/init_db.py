from backend.database.database import engine
from backend.database.database import Base

from backend.database.models import CampaignDB
from backend.database.models import AttackDB


def initialize_database():

    Base.metadata.create_all(
        bind=engine
    )

    print("Database initialized successfully.")


if __name__ == "__main__":
    initialize_database()