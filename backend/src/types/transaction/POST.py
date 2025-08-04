from datetime import datetime

from pydantic import BaseModel, Field


class newTransactionData(BaseModel):
    """
        For new transaction data (no object ID yet).
    """
    transactionName: str
    accountID: str
    value: int | float
    date: str = Field(default_factory=lambda: datetime().now().strftime("%Y-%m-%d"))
    # ^ MongoDB need "yyyy-mm-dd" format to query/compare dates
    memo: str | None