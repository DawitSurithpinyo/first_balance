interface registerItem {
    RegisterID: string,
    TranactionsName: string,
    AccountID: string
    Value: number,
    Date: string,
    Memo: string
}



interface RegisterJson {
    all_venues: registerItem[]
}

interface RegisterResponseJson {
    message : string
}