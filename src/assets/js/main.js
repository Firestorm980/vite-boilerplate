import '../css/style.css'

import db from './db'
import './form'

const characters = document.getElementById('characters')

export const renderCharacters = async () => {
  const { rows } = await db.allDocs({ include_docs: true })

  rows.forEach(async (row) => {
    const { id, doc } = row

    if (document.getElementById(id)) {
      return
    }

    const blob = await db.getAttachment(id, 'avatar')
    const avatarUrl = URL.createObjectURL(blob)

    const listItem = document.createElement('li')
    const template = document.getElementById('character-template')
    const clone = template.content.cloneNode(true)

    const avatar = clone.querySelector('.character__avatar')
    const name = clone.querySelector('.character__name')
    const bio = clone.querySelector('.character__bio')

    listItem.setAttribute('id', id)
    avatar.setAttribute('src', avatarUrl)
    name.textContent = `${doc.first_name} ${doc.last_name}`
    bio.textContent = doc.bio

    listItem.appendChild(clone)
    characters.append(listItem)
  })
}

const handleCharacterOnRemove = async (event) => {
  if (!event.target.matches('.character__remove')) {
    return
  }

  const listItem = event.target.closest('li')

  if (!listItem) {
    return
  }

  const doc = await db.get(listItem.id)

  await db.remove(doc)

  listItem.remove()
}

const bind = () => {
  characters.addEventListener('click', handleCharacterOnRemove)
}

const init = () => {
  bind()
  renderCharacters()
}

init()
