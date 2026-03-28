import { Router, RequestHandler } from 'express';
import * as projectController from '../controllers/project.controller';
import * as exportController from '../controllers/export.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

const auth = authenticate as unknown as RequestHandler;

router.use(auth);

router.get('/', projectController.listProjects as unknown as RequestHandler);
router.post('/', projectController.createProject as unknown as RequestHandler);
router.get('/:id', projectController.getProject as unknown as RequestHandler);
router.post('/:id/members', projectController.addMember as unknown as RequestHandler);
router.delete('/:id/members/:userId', projectController.removeMember as unknown as RequestHandler);
router.post('/:id/export', exportController.triggerExport as unknown as RequestHandler);

export default router;
