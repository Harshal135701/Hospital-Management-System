const { z } = require('zod');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ORDER_TYPES = ['medication', 'laboratory', 'imaging', 'procedure'];
const PRIORITIES = ['routine', 'urgent', 'stat'];
const ORDER_STATUSES = ['draft', 'placed', 'submitted', 'in_progress', 'completed', 'cancelled'];

const createOrderSchema = z.object({
  encounter_id: z.string().regex(uuidRegex, 'Valid encounter UUID is required').optional(),
  encounterId: z.string().regex(uuidRegex, 'Valid encounter UUID is required').optional(),

  order_type: z.string().optional().default('laboratory').transform((val) => val.toLowerCase()),
  order_name: z.string().min(1, 'Order name is required').max(200),
  instructions: z.string().max(2000).optional(),
  priority: z.string().optional().default('routine').transform((val) => val.toLowerCase()),
  status: z.string().optional().default('submitted').transform((val) => val.toLowerCase()),
  order_details: z.record(z.any()).optional(),
}).refine((data) => data.encounter_id || data.encounterId, {
  message: 'encounter_id or encounterId is required',
  path: ['encounter_id'],
});

const createOrderBatchSchema = z.object({
  encounter_id: z.string().regex(uuidRegex, 'Valid encounter UUID is required').optional(),
  encounterId: z.string().regex(uuidRegex, 'Valid encounter UUID is required').optional(),
  priority: z.string().optional().default('routine'),
  indication: z.string().max(2000).optional(),
  instructions: z.string().max(2000).optional(),
  orders: z.array(z.object({
    testId: z.string().optional(),
    testCode: z.string().optional(),
    testName: z.string().min(1, 'Test name is required'),
    category: z.string().optional(),
    department: z.string().optional(),
    specimen: z.string().optional(),
    turnaroundTime: z.string().optional(),
    order_type: z.string().optional(),
    priority: z.string().optional(),
    indication: z.string().optional(),
    instructions: z.string().optional(),
  })).min(1, 'At least one order item is required'),
}).refine((data) => data.encounter_id || data.encounterId, {
  message: 'encounter_id or encounterId is required',
  path: ['encounter_id'],
});

const updateOrderStatusSchema = z.object({
  status: z.string().transform((val) => val.toLowerCase()).refine((val) => ORDER_STATUSES.includes(val), {
    message: `status must be one of: ${ORDER_STATUSES.join(', ')}`,
  }),
  instructions: z.string().max(2000).optional(),
});

module.exports = {
  createOrderSchema,
  createOrderBatchSchema,
  updateOrderStatusSchema,
  ORDER_TYPES,
  PRIORITIES,
  ORDER_STATUSES,
};
