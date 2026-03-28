import { Router, RequestHandler } from 'express';
import * as taskController from '../controllers/task.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

const auth = authenticate as unknown as RequestHandler;

router.use(auth);

router.get('/', taskController.listTasks as unknown as RequestHandler);
router.post('/', taskController.createTask as unknown as RequestHandler);
router.patch('/:id', taskController.updateTask as unknown as RequestHandler);
router.delete('/:id', taskController.deleteTask as unknown as RequestHandler);

export default router;
