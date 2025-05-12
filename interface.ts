export interface RecordItem {
    TransactionName: string,
    AccountID: string
    Value: number,
    Date: string,
    Memo: string
}

export interface RecordJson {
    all_records: RecordItem[]
}

export interface RecordResponseJson {
    message : string
}