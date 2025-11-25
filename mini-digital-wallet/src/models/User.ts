export interface User {
    readonly userID: string;

    identity:{
        firstName: string;
        lastName: string;
        username?: string;
        contact:{
            email: string;
            phoneNumber?: number;
    };
        dateOfBirth: Date;
}

    authentication:{
        passwordHash: string;
        twoFactorEnabled: boolean;
        twoFactorMethod: 'sms' | 'email' | 'auth' | 'phoneNumber';
        // loginHistory: LoginEvent[];
    }

    compliance:{
        kycLevel:  1 | 2 | 3;
        kycStatus: 'pending' | 'verified' | 'rejected';
    }

    financial:{
        wallets: string[];
        defaultWalletId?: string;
        // withdraAccounts: WithdrawAccount[];
    }

    // disputeHistory: DisputeHistory[];
    emailVerified: boolean;
    phoneVerified: boolean;

    deviceFingerprint: string[];
    loginHistory: string[];
    blockedDevice: string[];
}