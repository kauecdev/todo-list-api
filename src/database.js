import fs from 'node:fs'
import fsPromise from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)

export class Database {
  #database = {}

  constructor() {
    const data = fs.readFileSync(databasePath, 'utf8')

    if (!data) {
      return this.#persist()
    }

    this.#database = JSON.parse(data)
  }

  #persist() {
    fsPromise.writeFile(databasePath, JSON.stringify(this.#database))
  }

  select(table, search) {
    let data = this.#database[table] ?? []

    if (search) {
      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase())
        })
      })
    }

    return data
  }

  selectById(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    if (rowIndex > -1) {
      return this.#database[table][rowIndex]
    }
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data)
    } else {
      this.#database[table] = [data]
    }

    this.#persist()

    return data
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)
    const task = this.#database[table][rowIndex]

    if (rowIndex > -1) {
      this.#database[table][rowIndex] = { id, ...task, ...data }
      this.#persist()
    }
  }

  complete(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)
    const task = this.#database[table][rowIndex]

    if (rowIndex > -1) {
      this.#database[table][rowIndex] = { ...task, completed_at: new Date() }
      this.#persist()
    }
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1)
      this.#persist()
    }
  }
}