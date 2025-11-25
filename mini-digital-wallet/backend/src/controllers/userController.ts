import {Router, Request, Response}from 'express'
import {createUser, getUserById} from '../services/userService.js';
import {User} from '../models/User.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const userData: User = req.body;
        const newUser = await createUser(userData);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({error: 'Failed to create user'});
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userID = req.params.id;
        const user = await getUserById(userID);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({error: 'User not found'});
        }
    } catch (error) {
        res.status(500).json({error: 'Failed to retrieve user'});
    }
});

export default router;