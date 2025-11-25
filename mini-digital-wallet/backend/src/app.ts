import express, {Response} from 'express';
import dotenv from 'dotenv';
// import userRouter from './controllers/userRoutes.js';
// import walletRouter from './controllers/walletRoutes.js';
// import transactionRouter from './controllers/transactionRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/', (res: Response) => {
    res.send('Mini Digital Wallet API is running');
});

// app.use('/users', userRouter);
// app.use('/wallets', walletRouter);
// app.use('/transactions', transactionRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;