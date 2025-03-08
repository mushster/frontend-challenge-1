import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { MrfFactory } from '../services/mrfFactory.js';
import fs from 'fs';
import path from 'path';

const mrfRoutes = new Hono();

// Define validation schema for claims data
const claimSchema = z.object({
  tin: z.string(),
  providerName: z.string(),
  npi: z.string(),
  procedureCode: z.string(),
  billingCodeType: z.string(),
  negotiatedRate: z.string().or(z.number()).transform(v => Number(v)),
  effectiveDate: z.string(),
  expirationDate: z.string(),
  serviceCode: z.string(),
  description: z.string()
});

const claimsPayloadSchema = z.object({
  claims: z.array(claimSchema)
});

// POST /generateMRF endpoint
mrfRoutes.post('/generateMRF', zValidator('json', claimsPayloadSchema), async (c) => {
  try {
    const { claims } = c.req.valid('json');
    
    // Use factory pattern to generate MRF data
    const mrfFactory = new MrfFactory();
    const mrfData = mrfFactory.createMrfFromClaims(claims);
    
    // Generate a filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `mrf-out-of-network-${timestamp}.json`;
    const filePath = path.join('data', filename);
    
    // Write to file
    fs.writeFileSync(filePath, JSON.stringify(mrfData, null, 2));
    
    return c.json({
      success: true,
      message: 'MRF file generated successfully',
      filename
    });
  } catch (error) {
    console.error('Error generating MRF file:', error);
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate MRF file'
    }, 500);
  }
});

// GET /mrf-files endpoint
mrfRoutes.get('/mrf-files', async (c) => {
  try {
    const dataDir = 'data';
    
    // Ensure directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      return c.json({ files: [] });
    }
    
    // Read directory and filter for MRF files
    const files = fs.readdirSync(dataDir)
      .filter(file => file.startsWith('mrf-'))
      .map(file => {
        const stats = fs.statSync(path.join(dataDir, file));
        return {
          filename: file,
          path: `/data/${file}`,
          createdAt: stats.birthtime,
          size: stats.size
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by creation date (newest first)
    
    return c.json({ files });
  } catch (error) {
    console.error('Error fetching MRF files:', error);
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch MRF files'
    }, 500);
  }
});

export { mrfRoutes }; 