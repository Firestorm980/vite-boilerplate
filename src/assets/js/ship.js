import db from './db'

const addShip = async (ship) => {
  const defaults = {
    _id: crypto.randomUUID(),
    characters: [],
    created_at: new Date().toISOString(),
    doc_type: 'ship',
    name: ''
  }

  const newShip = {
    ...defaults,
    ...ship
  }

  const doc = await db.put(newShip)

  return doc
}

const getShip = async (id) => {
  const doc = await db.get(id)

  return doc
}

const removeShip = async (id) => {
  const doc = await db.get(id)

  const removed = await db.remove(doc)

  return removed
}

const createIndexes = async () => {
  console.log('Create ship indexes')
}

export { addShip, getShip, removeShip, createIndexes }
