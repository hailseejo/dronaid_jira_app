import fs from 'node:fs';
import path from 'node:path';

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const parseRoster = (content) => {
  const rows = content.split(/\r\n|\n|\r/).map((line) => line.split(','));
  const headerIndex = rows.findIndex((row) =>
    row.includes('Full Name') && row.includes('Email Address')
  );

  if (headerIndex < 0) {
    throw new Error('The member CSV does not contain the expected headers.');
  }

  const headers = rows[headerIndex];
  const indexOf = (name) => headers.indexOf(name);
  const nameIndex = indexOf('Full Name');
  const emailIndex = indexOf('Email Address');
  const tierIndex = indexOf('Hierarchy Tier');
  const roleIndex = indexOf('Role & Subsystem');
  const memberIdIndex = headers.findIndex((header) => /member\s*id|id/i.test(header));

  return rows.slice(headerIndex + 1)
    .map((row) => ({
      hierarchyTier: row[tierIndex]?.trim() || '',
      fullName: row[nameIndex]?.trim() || '',
      email: row[emailIndex]?.trim().toLowerCase() || '',
      roleAndSubsystem: row[roleIndex]?.trim() || '',
      memberId: memberIdIndex >= 0 ? row[memberIdIndex]?.trim() || '' : '',
    }))
    .filter((member) => member.fullName && member.email.includes('@'));
};

const privateRosterPlugin = () => ({
  name: 'private-roster-endpoint',
  configureServer(server) {
    server.middlewares.use('/api/member-roster', (_request, response) => {
      try {
        const csvPath = path.resolve(process.cwd(), 'private-data/members.csv');
        const members = parseRoster(fs.readFileSync(csvPath, 'utf8'));
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({ members }));
      } catch (error) {
        response.statusCode = 500;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({ error: error.message }));
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), privateRosterPlugin()],
})
