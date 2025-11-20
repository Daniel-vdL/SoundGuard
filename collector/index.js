import 'dotenv/config'
import { SerialPort, ReadlineParser } from 'serialport'
import { supabase } from './supabaseClient.js'

const portPath = process.env.SERIAL_PORT || 'COM5'
const baudRate = parseInt(process.env.BAUD_RATE || '9600', 10)
const deviceId = process.env.DEVICE_ID || 'arduino-uno-01'
const WINDOW_MINUTES = 1
const WINDOW_MS = WINDOW_MINUTES * 60 * 1000
const SAMPLE_AGGREGATION_INTERVAL_MS = 1000
const THRESHOLD_AVG = 550
const THRESHOLD_MAX = 600 
const THRESHOLD_SPIKE = 600
const SPIKE_COOLDOWN_MS = 5000

console.log(`Connecting to serial port ${portPath} at ${baudRate} baud...`)

const port = new SerialPort({ path: portPath, baudRate })
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }))

let sampleBuffer = []

let windowSum = 0
let windowCount = 0
let windowMin = Infinity
let windowMax = -Infinity
let windowStart = Date.now()

let lastSpikeReportAt = 0

parser.on('data', (line) => {
  line = line.trim()
  if (!line) return

  try {
    const json = JSON.parse(line)
    if (typeof json.raw === 'number') {
      sampleBuffer.push(json)
    }
  } catch (err) {
    console.warn('Invalid JSON from Arduino:', line)
  }
})

setInterval(async () => {
  if (sampleBuffer.length === 0) return

  const raws = sampleBuffer.map((b) => b.raw)
  sampleBuffer = []

  const now = Date.now()

  for (const v of raws) {
    windowSum += v
    windowCount += 1
    if (v < windowMin) windowMin = v
    if (v > windowMax) windowMax = v

    if (v >= THRESHOLD_SPIKE && now - lastSpikeReportAt > SPIKE_COOLDOWN_MS) {
      const nowIso = new Date().toISOString()
      const text = `Directe piek gedetecteerd in kamer 1 (raw=${v}).`

      try {
        const { error: spikeError } = await supabase.from('reports').insert({
          type: 'auto',
          text,
          location: 'School',
          room: 'kamer 1',
          date: nowIso,
        })

        if (spikeError) {
          console.error('Supabase insert error (spike report):', spikeError.message)
        } else {
          console.log(`Spike report created for raw=${v}`)
          lastSpikeReportAt = now
        }
      } catch (err) {
        console.error('Insert failed (spike report):', err.message)
      }
    }
  }
}, SAMPLE_AGGREGATION_INTERVAL_MS)

setInterval(async () => {
  if (windowCount === 0) {
    windowStart = Date.now()
    return
  }

  const avg = windowSum / windowCount
  const min = windowMin
  const max = windowMax

  windowSum = 0
  windowCount = 0
  windowMin = Infinity
  windowMax = -Infinity
  windowStart = Date.now()

  try {
    const { data: measurement, error: measError } = await supabase
      .from('measurements')
      .insert({
        device_id: deviceId,
        avg_value: avg,
        min_value: min,
        max_value: max,
        room: 'kamer 1',
      })
      .select('id')
      .single()

    if (measError) {
      console.error('Supabase insert error (measurement):', measError.message)
      return
    }

    console.log(
      `Saved ${WINDOW_MINUTES}min measurement: avg=${avg.toFixed(
        1,
      )}, min=${min}, max=${max}`,
    )

    if (avg >= THRESHOLD_AVG || max >= THRESHOLD_MAX) {
      const nowIso = new Date().toISOString()
      const text = `Luid geluid gedetecteerd in kamer 1 over ${WINDOW_MINUTES} minuut (avg=${avg.toFixed(
        1,
      )}, min=${min}, max=${max}).`

      const { error: reportError } = await supabase.from('reports').insert({
        type: 'auto',
        text,
        location: 'School',
        room: 'kamer 1',
        date: nowIso,
        measurement_id: measurement.id,
      })

      if (reportError) {
        console.error('Supabase insert error (window report):', reportError.message)
      } else {
        console.log('Created auto report for high noise level (window).')
      }
    }
  } catch (err) {
    console.error('Insert failed (window measurement/report):', err.message)
  }
}, WINDOW_MS)

port.on('open', () => console.log('Serial port opened.'))
port.on('error', (err) => console.error('Serial error:', err.message))
