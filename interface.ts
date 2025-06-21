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

// Keep credentials of user
// If user login by manual sign-in/sign-up, the only fields they will have is UserEmail and UserName
// the rest are optional. They are Google-specific (except all the things about password)
export interface userCredentials {
    UserEmail: string,
    UserName: string,
    UserID?: string,
    UserPicture?: string | undefined | null,
    Token?: string,
    RefreshToken?: string,
    TokenURI?: string,
    ClientID?: string,
    GrantedScopes?: string[],
    Salt?: string, // for manual sign-in/sign-up
    HashedSaltedPassword?: string // for manual sign-in/sign-up
}
// when user hasn't logged in yet or logged out, the credentialsContext that keeps userCredentials will be
// {'UserEmail': '', 'UserName': ''}