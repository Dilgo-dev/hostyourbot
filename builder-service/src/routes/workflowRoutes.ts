import { Router } from 'express';
import {
  createWorkflow,
  getWorkflows,
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
} from '../controllers/workflowController';

const router = Router();

router.post('/workflows', createWorkflow);
router.get('/workflows', getWorkflows);
router.get('/workflows/:id', getWorkflow);
router.put('/workflows/:id', updateWorkflow);
router.delete('/workflows/:id', deleteWorkflow);

export default router;
