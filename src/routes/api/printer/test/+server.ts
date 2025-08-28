import { json } from '@sveltejs/kit';
import net from 'net';
import type { RequestHandler } from './$types';

const PRINTER_PORT = 9100; // Standard ZPL port

async function testPrinterConnection(printerIp: string): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const client = new net.Socket();
    
    client.connect(PRINTER_PORT, printerIp, () => {
      console.log(`Connected to printer at ${printerIp}`);
      client.destroy();
      resolve({ success: true });
    });
    
    client.on('error', (err) => {
      console.error(`Printer connection error (${printerIp}):`, err);
      client.destroy();
      resolve({ success: false, error: err.message });
    });
    
    client.setTimeout(5000, () => {
      console.log(`Printer connection timeout (${printerIp})`);
      client.destroy();
      resolve({ success: false, error: 'Connection timeout' });
    });
  });
}

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ success: false, error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { printerIp } = await request.json();
    
    if (!printerIp) {
      return json({ success: false, error: 'Printer IP is required' }, { status: 400 });
    }

    // Basic IP validation
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(printerIp)) {
      return json({ success: false, error: 'Invalid IP address format' }, { status: 400 });
    }

    const result = await testPrinterConnection(printerIp);
    
    if (result.success) {
      return json({ success: true, message: 'Printer connection successful' });
    } else {
      return json({ success: false, error: result.error || 'Connection failed' });
    }
  } catch (error) {
    console.error('Printer test error:', error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
};
