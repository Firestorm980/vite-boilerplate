export default class A11yLightbox {
  $current: HTMLLIElement | null;
  $dialog: HTMLDivElement | null;
  $galleryElement: HTMLElement | null;
  $galleryImages: NodeListOf<HTMLImageElement>;
  $dialogItems: HTMLLIElement[];
  $dialogImages: HTMLUListElement | null;
  $previouslyFocused: HTMLElement | null;
  $dialogRegion: HTMLDivElement | null;
  $controls: {
    close: HTMLButtonElement | null;
    fullscreen: HTMLButtonElement | null;
    previous: HTMLButtonElement | null;
    next: HTMLButtonElement | null;
  };
  $dialogContent: HTMLDivElement | null;
  $dialogControls: HTMLDivElement | null;
  $dialogAnnouce: HTMLDivElement | null;
  $dialogCounter: HTMLSpanElement | null;

  shown: boolean;
  _listeners: {
    [key: string]: Function[];
  };
  _observer: IntersectionObserver | null;
  settings: {
    id: string;
    title: string;
    close: string;
    fullscreen: string;
    previous: string;
    next: string;
    opensIn: string;
  };

  constructor (element, images, options = {}) {

    if (!element) {
      console.error('A11yLightbox: No element was provided.')
      return
    }

    if (!images) {
      console.error('A11yLightbox: No images were provided.')
      return
    }

    // Bindings
    this.hide = this.hide.bind(this)
    this.show = this.show.bind(this)
    this.fullscreen = this.fullscreen.bind(this)
    this._handleDialogKeydown = this._handleDialogKeydown.bind(this)
    this._handleDialogKeyup = this._handleDialogKeyup.bind(this)
    this._handleItemClick = this._handleItemClick.bind(this)
    this._handleNextClick = this._handleNextClick.bind(this)
    this._handlePreviousClick = this._handlePreviousClick.bind(this)
    this._handleWindowResize = this._handleWindowResize.bind(this)

    // Elements
    this.$current = null
    this.$dialog = null
    this.$galleryElement = element
    this.$galleryImages = images
    this.$dialogItems = []
    this.$dialogImages = null
    this.$previouslyFocused = null
    this.$dialogRegion = null
    this.$controls = {
      close: null,
      fullscreen: null,
      previous: null,
      next: null
    }

    // Data
    this.shown = false
    this._listeners = {}
    this._observer = null

    // Defaults
    const defaults = {
      // ID
      id: `gallery-${Date.now()}`,

      // Text Options
      title: 'My Gallery',
      close: 'Close this gallery',
      fullscreen: 'Toggle gallery fullscreen',
      previous: 'Go to previous item',
      next: 'Go to next item',
      opensIn: '(Opens image in a lightbox dialog)'
    }

    // Settings
    this.settings = { ...defaults, ...options }

    // Initialise everything needed for the dialog to work properly
    this.create()
  }

  /**
   * Debounce functions for better performance
   * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
   *
   * @param  {Function} fn The function to debounce
   * @returns {Function} The debounced function.
   */
  _debounce (fn) {
    // Setup a timer
    let timeout

    // Return a function to run debounced
    return function () {
      // Setup the arguments
      const context = this
      // eslint-disable-next-line prefer-rest-params
      const args = arguments

      // If there's a timer, cancel it
      if (timeout) {
        window.cancelAnimationFrame(timeout)
      }

      // Setup the new requestAnimationFrame()
      timeout = window.requestAnimationFrame(function () {
        fn.apply(context, args)
      })
    }
  }

  /**
   * Register a new callback for the given event type
   *
   * @param {string} type Type string.
   * @param {Function} handler Handler function.
   * @returns {object} instance
   */
  on (type, handler) {
    if (typeof this._listeners[type] === 'undefined') {
      this._listeners[type] = []
    }

    this._listeners[type].push(handler)

    return this
  }

  /**
   * Unregister an existing callback for the given event type
   *
   * @param {string} type Type string.
   * @param {Function} handler Handler function.
   * @returns {object} instance
   */
  off (type, handler) {
    const index = (this._listeners[type] || []).indexOf(handler)

    if (index > -1) {
      this._listeners[type].splice(index, 1)
    }

    return this
  }

  /**
   * Iterate over all registered handlers for given type and call them all with
   * the dialog element as first argument, event as second argument (if any).
   *
   * @access private
   * @param {string} type The event type.
   */
  _fire (type: string) {
    const listeners = this._listeners[type] || []

    listeners.forEach(
      function (listener) {
        listener(this.$galleryElement)
      }.bind(this)
    )
  }

  /**
   * Create a control.
   *
   * @param {string} key The unique string identifier to use.
   * @returns {Node} The complete button control.
   */
  _createControl (key) {
    const control = document.createElement('button')
    control.classList.add(`a11y-lightbox__${key}`)
    control.classList.add('a11y-lightbox__control')
    control.setAttribute('type', 'button')
    control.setAttribute('aria-label', this.settings[key])

    return control
  }

  /**
   * Creates all the controls.
   */
  _createControls () {
    const dialogControls = document.createElement('div')
    dialogControls.classList.add('a11y-lightbox__controls')
    const contolKeys = ['close', 'fullscreen', 'previous', 'next']

    contolKeys.forEach((key) => {
      const control = this._createControl(key)

      this.$controls[key] = control

      dialogControls.appendChild(control)
    })

    this.$dialogControls = dialogControls
  }

  /**
   * Creates the carousel.
   */
  _createCarousel () {
    const images = this.$galleryElement?.getElementsByTagName('img')
    const items = [] as HTMLLIElement[]
    const list = document.createElement('ul')

    list.classList.add('a11y-lightbox__images')

    if (images) {
      [...images].forEach((image) => {

        const figure = image.closest('figure')
        const figureClone = figure?.cloneNode(true) as HTMLElement;
        const item = document.createElement('li')
  
        figureClone.removeAttribute('class')
  
        item.classList.add('a11y-lightbox__images-item')
  
        item.appendChild(figureClone)
        list.appendChild(item)
  
        items.push(item)
      })
    }

    this.$dialogImages = list
    this.$dialogItems = items
  }

  /**
   * Creates the dialog.
   */
  _createDialog () {
    const dialog = document.createElement('div')
    dialog.classList.add('a11y-lightbox')
    dialog.setAttribute('id', this.settings.id)
    dialog.setAttribute('aria-hidden', 'true')

    const dialogOverlay = document.createElement('div')
    dialogOverlay.classList.add('a11y-lightbox__overlay')
    dialogOverlay.setAttribute('tabindex', '-1')

    const dialogContent = document.createElement('div')
    dialogContent.classList.add('a11y-lightbox__content')
    dialogContent.setAttribute('role', 'dialog')
    dialogContent.setAttribute('aria-label', this.settings.title)
    this.$dialogContent = dialogContent

    const dialogRegion = document.createElement('div')
    dialogRegion.classList.add('a11y-lightbox__region')
    dialogRegion.setAttribute('role', 'region')
    dialogRegion.setAttribute('tabindex', '0')
    dialogRegion.setAttribute('aria-label', 'Gallery (use arrows to navigate)')
    this.$dialogRegion = dialogRegion

    // Live region for page update
    const dialogAnnounce = document.createElement('div')
    dialogAnnounce.classList.add('a11y-lightbox__announce')
    dialogAnnounce.setAttribute('aria-live', 'polite')
    this.$dialogAnnouce = dialogAnnounce

    const dialogCounter = document.createElement('span')
    dialogCounter.classList.add('a11y-lightbox__counter')
    dialogCounter.setAttribute('aria-hidden', 'true')
    this.$dialogCounter = dialogCounter

    // Create controls
    this._createControls()
    const controls = this.$dialogControls

    // Create carousel
    this._createCarousel()
    const dialogImages = this.$dialogImages

    // Append all the things
    if (dialogImages) {
      dialogRegion.appendChild(dialogImages)
    }

    if (controls) {
      dialogContent.appendChild(controls)
    }

    dialogContent.appendChild(dialogCounter)
    dialogContent.appendChild(dialogRegion)
    dialog.appendChild(dialogAnnounce)
    dialog.appendChild(dialogOverlay)
    dialog.appendChild(dialogContent)

    this.$dialog = dialog
    this.$galleryElement?.appendChild(dialog)
  }

  /**
   * Create the entire gallery.
   *
   * @returns {object} Instance.
   */
  create () {
    // Create the dialog
    this._createDialog()

    this.$galleryImages.forEach((image, index) => {
      let target

      if (image?.parentElement?.matches('a')) {
        // Target is the link surrounding the image.
        target = image.parentElement
      } else {
        // No interative component exists.
        // Make one.
        const button = document.createElement('button')
        button.setAttribute('type', 'button')

        // insert button before image in the DOM tree
        image?.parentNode?.insertBefore(button, image)

        // move image into button
        button.appendChild(image)

        // Target is the button.
        target = button
      }

      target.dataset.galleryItemIndex = index

      // Create a visually hidden span.
      const span = document.createElement('span')
      span.classList.add('srt')
      span.textContent = this.settings.opensIn

      // Add for screen readers.
      // For additional context help so the user isn't confused when the link or button opens a dialog.
      target.appendChild(span)

      target?.addEventListener('click', this.show.bind(this))
    })

    // Execute all callbacks registered for the `create` event
    this._fire('create')

    return this
  }

  /**
   * Destroys the entire gallery.
   *
   * @returns {object} Instance.
   */
  destroy () {
    this.hide()

    this.$galleryImages.forEach((image) => {
      let target

      if (image?.parentElement?.matches('a')) {
        target = image.parentElement
      } else {
        target = image
      }

      target?.removeEventListener('click', this.show)
    })

    // Remove the dialog from the DOM
    if (this.$dialog) {
      this.$dialog.remove()
    }

    // Execute all callbacks registered for the `destroy` event
    this._fire('destroy')

    // Keep an object of listener types mapped to callback functions
    this._listeners = {}

    return this
  }

  /**
   * Show this gallery instance.
   *
   * @param {object} event The event object.
   * @returns {object} Instance.
   */
  show (event) {
    // If the dialog is already open, abort
    if (this.shown) {
      return this
    }

    event.stopPropagation()
    event.preventDefault()

    const { currentTarget } = event
    const galleryItemIndex = parseInt(currentTarget.dataset.galleryItemIndex, 10)
    const item = this.$dialogItems[galleryItemIndex]

    // Keep a reference to the currently focused element to be able to restore
    // it later
    this.$previouslyFocused = document.activeElement as HTMLElement;
    this.$dialog?.removeAttribute('aria-hidden')
    this._scroll(item)
    this.shown = true

    this._bind()
    this._connectObservers()

    const close = this.$dialog?.querySelector('.a11y-lightbox__close') as HTMLButtonElement
    close?.focus()

    // Execute all callbacks registered for the `show` event
    this._fire('show')

    return this
  }

  /**
   * Hide this gallery instance.
   *
   * @returns {object} Instance.
   */
  hide () {
    // If the dialog is already closed, abort
    if (!this.shown) {
      return this
    }

    this._unbind()
    this._disconnectObservers()

    // Remove fullscreen, if it was activated previously.
    if (document.exitFullscreen && document.fullscreenElement !== null) {
      document.exitFullscreen()
    }

    this.shown = false
    this.$dialog?.setAttribute('aria-hidden', 'true')

    // If there was a focused element before the dialog was opened (and it has a
    // `focus` method), restore the focus back to it
    // See: https://github.com/KittyGiraudel/a11y-dialog/issues/108
    if (this.$previouslyFocused && this.$previouslyFocused.focus) {
      this.$previouslyFocused.focus()
    }

    // Execute all callbacks registered for the `hide` event
    this._fire('hide')

    return this
  }

  /**
   * Make this gallery fullscreen.
   */
  fullscreen () {
    if (!document.fullscreenElement && this.$dialog?.requestFullscreen) {
      this.$dialog.requestFullscreen()
    } else if (document.exitFullscreen) {
      document.exitFullscreen()
    }

    this.goTo(this.$current)
    this._fire('fullscreen')
  }

  /**
   * Go to a specific slide list item.
   *
   * @param {Node} target The list item slide to go to.
   */
  goTo (target) {
    this._scroll(target)
    this._fire('goto')
  }

  /**
   * Scroll to a specific slide list item.
   *
   * @param {Node} target The list item slide to scroll to.
   */
  _scroll (target) {
    if (!target || !target.matches('.a11y-lightbox__images-item')) {
      return
    }

    const rect = target.getBoundingClientRect()

    const options = {
      behavior: 'auto',
      top: 0,
      left: rect.x
    } as ScrollToOptions

    this.$dialogRegion?.scrollBy(options)

    this._fire('scroll')
  }

  /**
   * Bind all event listeners.
   */
  _bind () {
    window.addEventListener('resize', this._handleWindowResize)
    this.$dialog?.addEventListener('keyup', this._handleDialogKeyup)
    this.$dialog?.addEventListener('keydown', this._handleDialogKeydown)
    this.$dialogImages?.addEventListener('click', this.hide)

    this.$galleryElement
      ?.querySelector('.a11y-lightbox__overlay')
      ?.addEventListener('click', this.hide)

    this.$galleryElement
      ?.querySelector('.a11y-lightbox__close')
      ?.addEventListener('click', this.hide)

    this.$galleryElement
      ?.querySelector('.a11y-lightbox__fullscreen')
      ?.addEventListener('click', this.fullscreen)

    this.$galleryElement
      ?.querySelector('.a11y-lightbox__previous')
      ?.addEventListener('click', this._handlePreviousClick)

    this.$galleryElement
      ?.querySelector('.a11y-lightbox__next')
      ?.addEventListener('click', this._handleNextClick)
  }

  /**
   * Unbind all event listeners.
   */
  _unbind () {
    window.removeEventListener('resize', this._handleWindowResize)
    this.$dialog?.removeEventListener('keyup', this._handleDialogKeyup)
    this.$dialog?.removeEventListener('keydown', this._handleDialogKeydown)
    this.$dialogImages?.removeEventListener('click', this.hide)

    this.$galleryElement
      ?.querySelector('.a11y-lightbox__overlay')
      ?.removeEventListener('click', this.hide)

    this.$galleryElement
      ?.querySelector('.a11y-lightbox__close')
      ?.removeEventListener('click', this.hide)

    this.$galleryElement
      ?.querySelector('.a11y-lightbox__fullscreen')
      ?.removeEventListener('click', this.fullscreen)

    this.$galleryElement
      ?.querySelector('.a11y-lightbox__previous')
      ?.removeEventListener('click', this._handlePreviousClick)

    this.$galleryElement
      ?.querySelector('.a11y-lightbox__next')
      ?.removeEventListener('click', this._handleNextClick)
  }

  /**
   * Connect observers.
   * Used for updating the active slide, counter.
   */
  _connectObservers () {
    const that = this

    const options = {
      root: this.$dialogRegion,
      rootMargin: '-10px'
    }

    const callback = (entries) => {
      entries.forEach((entry) => {
        const { target: item } = entry
        const interactiveElement = item.querySelector('a')

        // Reset all items
        item.classList.remove('is-active')

        if (interactiveElement) {
          interactiveElement.setAttribute('tabindex', -1)
        }

        // If intersectionRatio is 0, the target is out of view and we do not need to do anything.
        if (!entry.isIntersecting) {
          return
        }

        // Set the current item.
        that.$current = item

        // Update the current item.
        item.classList.add('is-active')

        if (interactiveElement) {
          interactiveElement.removeAttribute('tabindex')
        }
      })

      if (!that.$current) {
        return
      }

      // Update counter
      const current = that.$dialogItems.indexOf(that.$current) + 1
      const total = that.$dialogItems.length

      if (that.$dialogCounter) {
        that.$dialogCounter.textContent = `${current} / ${total}`
      }
      if (that.$dialogAnnouce) {
       that.$dialogAnnouce.textContent = `Showing item ${current} of ${total}`
      }

      // Update prev/next
      const $previous = that.$controls.previous
      const $next = that.$controls.next

      if ($previous) {
        $previous.disabled = false
      }
      if ($next) {
        $next.disabled = false
      }

      if (current === 1 && $previous) {
        $previous.disabled = true
      }
      if (current === total && $next) {
        $next.disabled = true
      }
    }

    this._observer = new IntersectionObserver(callback, options)

    this.$dialogItems.forEach(function (item) {
      that._observer?.observe(item)
    })
  }

  /**
   * Disconnect observers.
   */
  _disconnectObservers () {
    const that = this

    this.$dialogItems.forEach(function (item) {
      that._observer?.unobserve(item)
    })
  }

  /**
   * Handle item clicks.
   *
   * @param {object} event The event object.
   */
  _handleItemClick (event) {
    event.stopPropagation()
  }

  /**
   * Handle the dialog keyup event.
   *
   * @param {object} event The event object.
   */
  _handleDialogKeyup (event) {
    const { code } = event

    // Only care about escapes.
    if (code !== 'Escape') {
      return
    }

    // Hide if it is.
    this.hide()
  }

  /**
   * Handle the dialog keydown event.
   *
   * @param {object} event The event object.
   */
  _handleDialogKeydown (event) {
    const { code, shiftKey, target } = event

    // For arrow navigation.
    switch (code) {
      case 'ArrowLeft': {
        event.preventDefault()
        this._handlePreviousClick(event)
        break
      }
      case 'ArrowRight': {
        event.preventDefault()
        this._handleNextClick(event)
        break
      }
      case 'Tab': {
        const focusable = this.$dialog?.querySelectorAll(
          'a:not([tabindex]), button, [tabindex="0"]'
        )

        if (!focusable) {
          return
        }

        const first = focusable[0] as HTMLElement
        const last = focusable[focusable.length - 1] as HTMLElement

        if (first === target && shiftKey) {
          event.preventDefault()
          last.focus()
        }
        if (last === target && !shiftKey) {
          event.preventDefault()
          first.focus()
        }
        break
      }
      default: {
        break
      }
    }
  }

  /**
   * Handle the next click event.
   *
   * @param {object} event The event object.
   */
  _handleNextClick (event) {
    const items = this.$dialogItems

    if (!items.length || !this.$current) {
      return
    }

    const indexOfCurrent = items.indexOf(this.$current)
    const item = items[indexOfCurrent + 1]

    event.stopPropagation()

    // Only go if the item exists.
    if (item) {
      this.goTo(item)
    }
  }

  /**
   * Handle the previous click event.
   *
   * @param {object} event The event object.
   */
  _handlePreviousClick (event) {
    const items = this.$dialogItems

    if (!items.length || !this.$current) {
      return
    }

    const indexOfCurrent = items.indexOf(this.$current)
    const item = items[indexOfCurrent - 1]

    event.stopPropagation()

    // Only go if the item exists.
    if (item) {
      this.goTo(item)
    }
  }

  /**
   * Handle the window resize event.
   * Just for recentering the slide.
   */
  _handleWindowResize () {
    this._debounce(this._scroll(this.$current))
  }
}
