import { Router, RequestHandler } from 'express';
import * as exportController from '../controllers/export.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

const auth = authenticate as unknown as RequestHandler;

router.use(auth);

router.get('/', exportController.listExports as unknown as RequestHandler);
router.get('/:exportId', exportController.getExportStatus as unknown as RequestHandler);
router.get('/:exportId/download', exportController.downloadExport as unknown as RequestHandler);

export default router;
