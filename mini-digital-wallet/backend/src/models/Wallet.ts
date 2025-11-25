

export type Wallet = {
    readonly walletID: string;
    readonly userID: string;
    walletBalance:{
        balance: number;
        availableBalance: number;
        lockedBalnce: number;
    };
    currency: string;

    status: 'pending' | 'frozen' | 'suspended' | 'closed';
    createdAt: Date;
    updatedAt: Date;
    lastTransaction: Date | null;
    meta?: Record<string, any>
    notes?: string;
}