import express from 'express';
import dotenv from 'dotenv';
import userController from './controllers/userController';
import walletController from './controllers/walletControllers';
// import transactionRouter from './controllers/transactionRoutes';

dotenv.config();

const app = express();
app.use(express.json());

// app.get('/', (res: Response) => {
//     res.send('Mini Digital Wallet API is running');
// });

app.use('/api/users', userController);
app.use('/api/wallets', walletController);
// app.use('/api/transactions', transactionRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;