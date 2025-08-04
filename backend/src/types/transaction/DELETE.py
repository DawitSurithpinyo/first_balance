from pydantic import BaseModel


class deleteOneTransactionRequest(BaseModel):
    transactionID: str

class deleteManyTransactionsRequest(BaseModel):
    transactionIDsList: list[str]