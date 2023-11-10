import A11yLightbox from './a11y-lightbox.ts'

const gallery = document.querySelector('.wp-block-gallery')
const images = gallery.querySelectorAll('img')

if (gallery) {
  // eslint-disable-next-line no-unused-vars
  const lightbox = new A11yLightbox(gallery, images)
}
