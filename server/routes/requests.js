import express from 'express';
import Request from '../models/Request.js';

const router = express.Router();

// Get all requests (optional query: managerId, status)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.managerId) filter.managerId = req.query.managerId;
    if (req.query.status) filter.status = req.query.status;

    const requests = await Request.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get request by id
router.get('/:id', async (req, res) => {
  try {
    const r = await Request.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    res.json(r);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create request
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    const r = new Request(payload);
    const saved = await r.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update request
router.put('/:id', async (req, res) => {
  try {
    const updated = await Request.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete request
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Request.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
