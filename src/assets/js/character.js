/* eslint-disable camelcase */
import db from './db'

export const addCharacter = async (character) => {
  const { first_name, last_name, gender, bio, avatar } = character

  const newCharacter = {
    _id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    first_name,
    last_name,
    gender,
    bio
  }

  if (avatar) {
    newCharacter._attachments = {
      avatar: {
        content_type: avatar.type,
        data: avatar
      }
    }

    const doc = await db.put(newCharacter)

    return doc
  }
}

export const getCharacter = async (id) => {
  const doc = await db.get(id)

  return doc
}

export const removeCharacter = async (id) => {
  const doc = await db.get(id)

  const removed = await db.remove(doc)

  return removed
}
