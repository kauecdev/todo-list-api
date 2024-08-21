import fs from 'fs'
import { parse } from 'csv-parse'
import { randomUUID } from 'crypto'

import { Database } from './database.js'

const csvPath = new URL('../data.csv', import.meta.url)

function importDataFromCsv() {
  const database = new Database()

  fs.createReadStream(csvPath)
    .pipe(parse({ delimiter: ',', fromLine: 2}))
    .on('data', (csvRow) => {
      if (!csvRow[0] || !csvRow[1]) {
        throw new Error('Each task should have title and description')
      }

      const task = {
        id: randomUUID(),
        title: csvRow[0],
        description: csvRow[1],
        created_at: new Date(), 
        updated_at: new Date()
      }

      database.insert('tasks', task)
    })
    .on('finish', () => {
      console.log('Import successfully finished.')
    })
    .on('error', (err) => {
      console.log('An error ocurred, check logs.')
      console.error(err)
    })
}

importDataFromCsv()