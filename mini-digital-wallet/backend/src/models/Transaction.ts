export type TransactionStatus = 'initiated' | 'pending' | 'success' | 'failed' | 'reversed' | 'cancelled';

export type Channel = 'internal' | 'bank' | 'card' | 'ussd' | 'processor';

export type LegderSide = 'debit' | 'credit';

export type Purpose = 'wallet_transfer' | 'funding' | 'airtime' | 'purchase' | 'withdrawal' | 'fee' | 'settlement' | 'chargeback' | 'reversal';

export interface Transaction{
    readonly transactionID: string;
    idempotencyKeyId?: string; 
    readonly reference: string;  
    readonly amount: number;
    readonly transactionType: 'debit' | 'credit';
    readonly senderWalletID?: string;
    readonly receiverWalletID?: string;
    purpose: Purpose;
    balanceBefore: number;
    balanceAfter: number;
    status: TransactionStatus;
    currency: 'NGN';
    fee?: number;
    settlementReference?: string;
    accountingCategory?: string;
    // isFlagged: boolean;
    channel: Channel;
    notes?: string;
    metaData: Record<string, any>;
    readonly createdAt: Date;
    readonly updateAt: Date;
    attemptAt: string | null;
    failureCode: string | null;
}

export interface LegderEntry{
    ledgerEntryId: string;
    transactionId: string;
    walletId: string | null;
    amount: number;
    effectiveDate: string;
    narration?: string;
    createdAt: string;
    reversedBy: string | null;
}