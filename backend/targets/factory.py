from fastapi import HTTPException

from backend.database.models import TargetDB
from backend.targets.mock_target import MockTarget


def create_target_instance(target: TargetDB):

    if target.target_type == "MOCK":

        return MockTarget()

    raise HTTPException(
        status_code=400,
        detail=(
            f"Unsupported target type: "
            f"{target.target_type}"
        )
    )