import { db } from './db'

const characters = document.getElementById('characters')

const renderCharacters = async () => {
  const query = await db.find({
    selector: {
      doc_type: 'character',
      created_at: { $gte: null }
    },
    sort: ['created_at'],
    use_index: ['created_at', 'doc_type']
  })

  const { docs } = query

  console.log(docs)

  docs.forEach(async (doc) => {
    const { _id: id } = doc

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

const init = async () => {
  console.log('list.js')

  bind()
  await renderCharacters()
}

export { renderCharacters }
export default init
