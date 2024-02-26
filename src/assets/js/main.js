/* eslint-disable no-unused-vars */
import '../css/style.css'
import { timeline, animate, stagger } from 'motion'

async function wait (ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

async function designerAnimation () {
  const designerLines = document.querySelectorAll('.designer__line')
  const designerPath = document.querySelector('.designer__path')
  const designerText = document.querySelector('.text--designer')

  return new Promise((resolve, reject) => {
    timeline([
      [
        designerLines,
        { opacity: [0, 0.5] },
        { duration: 2, delay: stagger(0.2) }
      ],
      [
        designerPath,
        { strokeDashoffset: [1000, 0] },
        { duration: 5, at: '-0.5' }
      ],
      { name: 'start', at: '-3' },
      [
        designerText,
        { fillOpacity: [0, 1] },
        { duration: 2, at: 'start' }
      ],
      [
        designerPath,
        { opacity: [1, 0] },
        { duration: 1, at: 'start' }
      ],
      [
        designerLines,
        { opacity: [0.5, 0] },
        { duration: 1, at: 'start' }
      ]
    ]).finished.then(resolve)
  })
}

async function developerAnimation () {
  const developerCursor = document.querySelector('.developer__cursor')
  const developerMask = document.querySelector('.developer__mask')
  const developerPath = document.querySelector('.developer__path')
  const developerText = document.querySelector('.text--developer')

  return new Promise((resolve, reject) => {
    animate(
      developerCursor,
      { opacity: [1, 0, 1] },
      { duration: 1, repeat: Infinity }
    )

    timeline([
      'start',
      [
        developerCursor,
        { x: [0, 687] },
        { duration: 2, easing: 'steps(11)', at: 'start' }
      ],
      [
        developerMask,
        { x: [-687, 0] },
        { duration: 2, easing: 'steps(11)', at: 'start' }
      ],
      { name: 'crossfade', at: '+2' },
      [
        developerCursor,
        { opacity: [1, 0] },
        { duration: 1, at: 'crossfade' }
      ],
      [
        developerPath,
        { opacity: [1, 0] },
        { duration: 1, at: 'crossfade' }
      ],
      [
        developerText,
        { fillOpacity: [0, 1] },
        { duration: 2, at: 'crossfade' }
      ]
    ]).finished.then(resolve)
  })
}

function nerdAnimation () {

}

async function init () {
  // await designerAnimation()
  // await developerAnimation()
  nerdAnimation()
};

init()
