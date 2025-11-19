import 'dotenv/config';
import { SerialPort, ReadlineParser } from 'serialport';
import { supabase } from './supabaseClient.js';

const portPath = process.env.SERIAL_PORT || 'COM5';
const baudRate = parseInt(process.env.BAUD_RATE || '9600', 10);
const deviceId = process.env.DEVICE_ID || 'arduino-uno-01';

console.log(`Connecting to serial port ${portPath} at ${baudRate} baud...`);

const port = new SerialPort({ path: portPath, baudRate });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

let buffer = [];

// Data binnenkrijgen van Arduino
parser.on('data', (line) => {
  line = line.trim();
  if (!line) return;

  try {
    const json = JSON.parse(line);
    // verwacht: { raw: 493, baseline: 480, loud: true/false }
    if (typeof json.raw === 'number') {
      buffer.push(json);
    }
  } catch (err) {
    console.warn('Invalid JSON from Arduino:', line);
  }
});

// Elke seconde: data aggregeren en naar Supabase sturen
setInterval(async () => {
  if (buffer.length === 0) return;

  const raws = buffer.map((b) => b.raw);
  const avg =
    raws.reduce((sum, v) => sum + v, 0) / raws.length;
  const min = Math.min(...raws);
  const max = Math.max(...raws);

  buffer = [];

  try {
    const { error } = await supabase.from('measurements').insert({
      device_id: deviceId,
      avg_value: avg,
      min_value: min,
      max_value: max,
      room: 'kamer 1',
    });

    if (error) {
      console.error('Supabase insert error:', error.message);
    } else {
      console.log(
        `Saved measurement: avg=${avg.toFixed(1)}, min=${min}, max=${max}`
      );
    }
  } catch (err) {
    console.error('Insert failed:', err.message);
  }
}, 1000);

// Event-handlers voor debugging
port.on('open', () => console.log('Serial port opened.'));
port.on('error', (err) => console.error('Serial error:', err.message));
