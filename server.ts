import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { DEMO_PATIENTS, DEMO_HOSPITALS, DEMO_AMBULANCES, DEMO_EMERGENCIES, INITIAL_AUDIT_LOGS, DEMO_USERS } from './src/data/mockData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory persistent database simulation
let patientsDb = [...DEMO_PATIENTS];
let hospitalsDb = [...DEMO_HOSPITALS];
let ambulancesDb = [...DEMO_AMBULANCES];
let emergenciesDb = [...DEMO_EMERGENCIES];
let auditLogsDb = [...INITIAL_AUDIT_LOGS];

// 1. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    system: 'EmergencyLink',
    version: '2026.1.0',
    timestamp: new Date().toISOString(),
  });
});

// 2. Authentication endpoint
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = DEMO_USERS.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
  if (user) {
    res.json({
      success: true,
      token: `jwt-token-sec-${user.id}-${Date.now()}`,
      user,
    });
  } else {
    res.json({
      success: true,
      token: `jwt-token-guest-${Date.now()}`,
      user: {
        id: 'USR-TEMP',
        name: 'Staff Responder',
        email: email || 'responder@emergencylink.health',
        role: 'DOCTOR',
        badgeNumber: 'DOC-5501',
        department: 'Emergency Response Unit',
      },
    });
  }
});

// 3. Patients API
app.get('/api/patients', (_req: Request, res: Response) => {
  // Returns sanitized summaries without exposing full critical files
  const summaries = patientsDb.map((p) => ({
    id: p.id,
    name: p.name,
    age: p.age,
    gender: p.gender,
    bloodGroup: p.bloodGroup,
    primaryAllergy: p.criticalAlerts[0]?.condition || 'None',
  }));
  res.json(summaries);
});

app.get('/api/patients/:id', (req: Request, res: Response) => {
  const patient = patientsDb.find((p) => p.id === req.params.id || p.qrToken === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found in emergency registry' });
  }

  // Record audit log
  auditLogsDb.unshift({
    id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
    userId: 'API-CLIENT',
    userName: 'Attending Emergency Responder',
    userRole: 'DOCTOR',
    patientId: patient.id,
    patientName: patient.name,
    action: 'VIEW_EMERGENCY_PROFILE',
    result: 'SUCCESS',
    ipAddress: req.ip || '127.0.0.1',
    deviceInfo: req.headers['user-agent'] || 'API Client',
    details: 'Profile accessed via REST API /api/patients/:id',
  });

  res.json(patient);
});

// 4. Hospitals & Resources API
app.get('/api/hospitals', (_req: Request, res: Response) => {
  res.json(hospitalsDb);
});

app.put('/api/hospitals/:id/resources', (req: Request, res: Response) => {
  const hosp = hospitalsDb.find((h) => h.id === req.params.id);
  if (!hosp) {
    return res.status(404).json({ error: 'Hospital facility not found' });
  }

  const { resources, emergencyDeptStatus } = req.body;
  if (resources) hosp.resources = { ...hosp.resources, ...resources };
  if (emergencyDeptStatus) hosp.emergencyDeptStatus = emergencyDeptStatus;

  auditLogsDb.unshift({
    id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
    userId: 'USR-HADM-01',
    userName: 'David Sterling, MHA',
    userRole: 'HOSPITAL_ADMIN',
    action: 'UPDATE_HOSPITAL_RESOURCE',
    result: 'SUCCESS',
    ipAddress: req.ip || '127.0.0.1',
    deviceInfo: req.headers['user-agent'] || 'API Client',
    details: `Updated hospital ${hosp.name} resources via REST API`,
  });

  res.json({ success: true, hospital: hosp });
});

// 5. Emergencies API
app.get('/api/emergencies', (_req: Request, res: Response) => {
  res.json(emergenciesDb);
});

app.post('/api/emergencies', (req: Request, res: Response) => {
  const { patientId, emergencyType, severity, location, requiredResources, notes } = req.body;
  const patient = patientsDb.find((p) => p.id === patientId);

  const newId = `EMG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const newEmg = {
    id: newId,
    patientId,
    patientName: patient ? patient.name : 'Unknown Patient',
    patientBloodGroup: patient ? patient.bloodGroup : 'Unknown',
    emergencyType,
    severity,
    status: 'CREATED' as const,
    location,
    requiredResources: requiredResources || [],
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdByUserId: 'USR-MED-01',
    createdByName: 'Marcus Taylor, EMT-P',
    timeline: [
      {
        status: 'CREATED' as const,
        label: 'Emergency Initiated via REST API',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: 'REST API Dispatch',
      },
    ],
  };

  emergenciesDb.unshift(newEmg);
  res.status(201).json(newEmg);
});

// 6. Ambulances API
app.get('/api/ambulances', (_req: Request, res: Response) => {
  res.json(ambulancesDb);
});

// 7. Audit Logs API
app.get('/api/audit-logs', (_req: Request, res: Response) => {
  res.json(auditLogsDb);
});

// Vite Middleware Integration or Static Production Serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In dev mode, mount Vite middleware
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn('Vite middleware initialization warning:', err);
    }
  }

  app.listen(PORT, () => {
    console.log(`EmergencyLink server listening on port ${PORT}`);
  });
}

// Only start when executed directly
if (process.env.START_SERVER === 'true') {
  startServer();
}

export default app;
