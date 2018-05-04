import tingle from 'tingle.js/dist/tingle.min'

function bindModal (button, content) {
  let modal = createModal()

  button.onclick = () => {
    modal.setContent(content)
    content.style.display = 'block'
    content.classList.remove('hidden')
    modal.open()
  }
}

function showModal (content) {
  let modal = createModal()
  modal.setContent(content)
  modal.open()
}

function createModal () {
  let modal = new tingle.modal({
    footer: true,
    stickyFooter: false,
    closeMethods: ['overlay', 'button', 'escape'],
    closeLabel: 'Закрыть',
    cssClass: ['section-dark']
  })

  modal.addFooterBtn('Закрыть', 'button-rounded gradient-orange center', function () {
    modal.close()
  })

  return modal
}

export {bindModal, showModal, createModal}