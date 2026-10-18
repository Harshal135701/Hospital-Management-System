const { z } = require('zod');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ORDER_TYPES = ['medication', 'laboratory', 'imaging', 'procedure'];
const PRIORITIES = ['routine', 'urgent', 'stat'];
const ORDER_STATUSES = ['draft', 'placed', 'in_progress', 'completed', 'cancelled'];

const createOrderSchema = z.object({
  encounter_id: z.string().regex(uuidRegex, 'Valid encounter UUID is required').optional(),
  encounterId: z.string().regex(uuidRegex, 'Valid encounter UUID is required').optional(),

  order_type: z.string().transform((val) => val.toLowerCase()).refine((val) => ORDER_TYPES.includes(val), {
    message: `order_type must be one of: ${ORDER_TYPES.join(', ')}`,
  }),
  order_name: z.string().min(1, 'Order name is required').max(200),
  instructions: z.string().max(2000).optional(),
  priority: z.string().optional().default('routine').transform((val) => val.toLowerCase()).refine((val) => PRIORITIES.includes(val), {
    message: `priority must be one of: ${PRIORITIES.join(', ')}`,
  }),
  status: z.string().optional().default('placed').transform((val) => val.toLowerCase()).refine((val) => ORDER_STATUSES.includes(val), {
    message: `status must be one of: ${ORDER_STATUSES.join(', ')}`,
  }),
  order_details: z.record(z.any()).optional(),
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
  updateOrderStatusSchema,
  ORDER_TYPES,
  PRIORITIES,
  ORDER_STATUSES,
};
