import { addCharacter } from './character'
import { renderCharacters } from './list'

const form = document.querySelector('form')

const handleFormOnSubmit = async (event) => {
  event.preventDefault()
  const formData = new FormData(form)
  const data = Object.fromEntries(formData.entries())

  await addCharacter(data)
  await renderCharacters()
  form.reset()
}

const bind = () => {
  form.addEventListener('submit', handleFormOnSubmit)
}

const init = () => {
  console.log('form.js')

  bind()
}

export default init
