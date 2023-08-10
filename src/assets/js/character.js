/* eslint-disable camelcase */
import { db } from './db'

const addCharacter = async (character) => {
  const { avatar } = character
  const defaults = {
    _id: crypto.randomUUID(),
    bio: '',
    created_at: new Date().toISOString(),
    doc_type: 'character',
    first_name: '',
    gender: 'na',
    last_name: ''
  }

  const newCharacter = {
    ...defaults,
    ...character
  }

  if (avatar) {
    newCharacter._attachments = {
      avatar: {
        content_type: avatar.type,
        data: avatar
      }
    }
  }

  const doc = await db.put(newCharacter)

  return doc
}

const getCharacter = async (id) => {
  const doc = await db.get(id)

  return doc
}

const removeCharacter = async (id) => {
  const doc = await db.get(id)

  const removed = await db.remove(doc)

  return removed
}

const createIndexes = async () => {
  console.log('Create character indexes')
  try {
    await db.createIndex({
      index: {
        fields: ['first_name'],
        ddoc: 'first_name'
      }
    })

    await db.createIndex({
      index: {
        fields: ['last_name'],
        ddoc: 'last_name'
      }
    })
  } catch (err) {
    console.log(err)
  }
}

export { addCharacter, getCharacter, removeCharacter, createIndexes }
