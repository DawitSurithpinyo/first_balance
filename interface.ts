export interface RecordItem {
    TransactionName: string,
    AccountID: string,
    Value: number,
    Date: string,
    Memo: string,
    _id?: string
}

export interface RecordJson {
    all_records: RecordItem[]
}

export interface RecordResponseJson {
    message : string
}

export interface Filters {
    TransactionNameFilter: string,
    AccountIDFilter: string,
    MinValue: number,
    MaxValue: number,
    StartDate: string | Date | undefined | null,
    EndDate: string | Date | undefined | null,
    MemoFilter: string
}