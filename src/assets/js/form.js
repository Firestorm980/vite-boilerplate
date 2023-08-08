import { addCharacter } from './character'
import { renderCharacters } from './main'

const form = document.querySelector('form')

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  const formData = new FormData(form)
  const data = Object.fromEntries(formData.entries())

  await addCharacter(data)
  renderCharacters()
  form.reset()
})
