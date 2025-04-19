document.addEventListener('DOMContentLoaded', function () {
  // Gallery carousel functionality
  initGallery()

  // Initialize leaderboard WebSocket
  initLeaderboard()

  // Smooth scrolling for navigation links
  initSmoothScroll()
})

// Gallery carousel
function initGallery() {
  const gallery = document.querySelector('.gallery')
  const galleryItems = document.querySelectorAll('.gallery-item')
  const dots = document.querySelectorAll('.gallery-dot')
  const prevBtn = document.querySelector('.gallery-button.prev')
  const nextBtn = document.querySelector('.gallery-button.next')

  let currentIndex = 0

  function updateGallery() {
    // Calculate scroll position
    const scrollPosition =
      galleryItems[currentIndex].offsetLeft - gallery.offsetLeft

    // Scroll to the current item
    gallery.scrollTo({
      left: scrollPosition,
      behavior: 'smooth',
    })

    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex)
    })
  }

  // Event listeners for dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentIndex = index
      updateGallery()
    })
  })

  // Event listeners for prev/next buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentIndex =
        (currentIndex - 1 + galleryItems.length) % galleryItems.length
      updateGallery()
    })
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % galleryItems.length
      updateGallery()
    })
  }

  // Initialize gallery
  updateGallery()

  // Auto-advance gallery every 5 seconds
  setInterval(() => {
    currentIndex = (currentIndex + 1) % galleryItems.length
    updateGallery()
  }, 5000)
}

// Leaderboard WebSocket connection
function initLeaderboard() {
  const leaderboardTable = document.getElementById('leaderboard-table')
  if (!leaderboardTable) return

  // TODO: verificar CORS.
  const socket = new WebSocket('wss://lara-bomb-api.insper.dev/ws/leaderboard')

  // Connection opened
  socket.addEventListener('open', (event) => {
    console.log('Conectado ao servidor de leaderboard')
  })

  // Listen for messages
  socket.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data)

      if (data.leaderboard) {
        // Clear current leaderboard
        const tbody = leaderboardTable.querySelector('tbody')
        tbody.innerHTML = ''

        // Add leaderboard data
        data.leaderboard.forEach((player, index) => {
          const row = document.createElement('tr')

          const rankCell = document.createElement('td')
          rankCell.textContent = index + 1

          const nameCell = document.createElement('td')
          nameCell.textContent = player.username

          const winsCell = document.createElement('td')
          winsCell.textContent = player.wins

          row.appendChild(rankCell)
          row.appendChild(nameCell)
          row.appendChild(winsCell)

          tbody.appendChild(row)
        })
      }
    } catch (error) {
      console.error('Erro ao processar dados do leaderboard:', error)
    }
  })

  // Connection closed
  socket.addEventListener('close', (event) => {
    console.log('Desconectado do servidor de leaderboard')

    // Tentar reconectar após 5 segundos
    setTimeout(initLeaderboard, 5000)
  })

  // Connection error
  socket.addEventListener('error', (event) => {
    console.error('Erro no WebSocket do leaderboard:', event)
  })
}

// Smooth scrolling for navigation links
function initSmoothScroll() {
  const navLinks = document.querySelectorAll('.nav-link')

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault()

      const targetId = link.getAttribute('href')
      const targetElement = document.querySelector(targetId)

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 70, // Ajuste para altura do cabeçalho
          behavior: 'smooth',
        })
      }
    })
  })
}

// Mobile navigation toggle (se você adicionar um menu hambúrguer para dispositivos móveis)
function initMobileNav() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn')
  const nav = document.querySelector('.nav')

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      nav.classList.toggle('active')
      mobileMenuBtn.classList.toggle('active')
    })
  }
}
