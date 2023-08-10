import '../css/style.css'

import dbInit from './db'
import formInit from './form'
import listInit from './list'

const init = async () => {
  // Make sure the DB is ready first.
  await dbInit()

  // Initialize the form.
  formInit()

  // Initialize the list.
  listInit()
}

init()
