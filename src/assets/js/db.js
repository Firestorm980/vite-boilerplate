// eslint-disable-next-line no-unused-vars
import events from 'events' // Needed for PouchDB for some silly reason.
import PouchDB from 'pouchdb'

const db = new PouchDB('mydb')

db.info().then((info) => {
  console.log(info)
})

export default db
