export type TransactionStatus = 'pending' | 'success' | 'failed';
export interface Transaction{
    readonly transactionID: string; 
    readonly reference: string;  
    readonly amount: number;
    readonly transactionType: 'DEBIT' | 'CREDIT';
    purpose: string;    //wallet_transfer, funding, purchase, cashback e.t.c
    balanceBefore: number;
    balanceAfter: number;
    status: TransactionStatus;
    senderWalletID: string;
    receiverWalletID: string;
    isFlagged: boolean;
    notes?: string;
    readonly createdAt: Date;
    readonly updateAt: Date
}