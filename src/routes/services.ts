import express from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

const mockServices = [
  { _id: 'srv1', name: 'Flex Printing', basePrice: 500 },
  { _id: 'srv2', name: 'Photographer Flex Printing', basePrice: 600 },
  { _id: 'srv3', name: 'Identity / Passport Photo', basePrice: 150 },
  { _id: 'srv4', name: 'Photography', basePrice: 5000 },
  { _id: 'srv5', name: 'CopingPhoto', basePrice: 50 },
  { _id: 'srv6', name: 'Mobile Print', basePrice: 20 },
  { _id: 'srv7', name: 'Photo Dream', basePrice: 2000 },
  { _id: 'srv8', name: 'Lamination', basePrice: 50 },
  { _id: 'srv9', name: 'Photo Album', basePrice: 3000 },
  { _id: 'srv10', name: 'Trophy', basePrice: 400 },
  { _id: 'srv11', name: 'Mug Printing', basePrice: 250 },
  { _id: 'srv12', name: 'Soft Copy/Digital Bord Photo', basePrice: 100 },
  { _id: 'srv13', name: 'Wedding Album', basePrice: 15000 },
  { _id: 'srv14', name: 'Video Shooting', basePrice: 10000 },
  { _id: 'srv15', name: 'Pre./After Wedding', basePrice: 8000 },
  { _id: 'srv16', name: 'Drone', basePrice: 5000 }
];

router.get('/', authenticateToken, (req, res) => {
  // In a real app, this would fetch from MongoDB
  res.json(mockServices);
});

export default router;
