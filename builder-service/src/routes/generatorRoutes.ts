import { Router } from 'express';
import { generateFromWorkflow, generateDirect } from '../controllers/generatorController';

const router = Router();

router.post('/workflows/:id/generate', generateFromWorkflow);
router.post('/generate', generateDirect);

export default router;
