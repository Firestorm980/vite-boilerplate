// eslint-disable-next-line no-unused-vars
import events from 'events' // Needed for PouchDB for some silly reason.
import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'

import { createIndexes as createCharacterIndexes } from './character'
import { createIndexes as createShipIndexes } from './ship'

PouchDB.plugin(PouchDBFind)

export const db = new PouchDB('mydb')

const createIndexes = async () => {
  console.log('Create default indexes')
  await db.createIndex({
    index: {
      fields: ['created_at'],
      ddoc: 'created_at'
    }
  })

  await db.createIndex({
    index: {
      fields: ['doc_type'],
      ddoc: 'doc_type'
    }
  })
}

const init = async () => {
  console.log('db created')

  const info = await db.info()
  console.log(info)

  console.log('Creating indexes')

  await createIndexes()
  await createCharacterIndexes()
  await createShipIndexes()

  console.log('Indexes created')

  try {
    const result = await db.getIndexes()
    console.log(result)
  } catch (err) {
    console.log(err)
  }
}

export default init
