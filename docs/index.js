document.addEventListener('DOMContentLoaded', function () {
  initGallery()
  initDownloads()
  initMobileNav()
  initLeaderboard()
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
    const scrollPosition =
      galleryItems[currentIndex].offsetLeft - gallery.offsetLeft

    gallery.scrollTo({
      left: scrollPosition,
      behavior: 'smooth',
    })

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex)
    })
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentIndex = index
      updateGallery()
    })
  })

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

  updateGallery()

  // só pra avançar sozinho a cada 5 segundos.
  setInterval(() => {
    currentIndex = (currentIndex + 1) % galleryItems.length
    updateGallery()
  }, 5000)
}

// Leaderboard WebSocket connection
function initLeaderboard() {
  const leaderboardTable = document.getElementById('leaderboard-table')
  if (!leaderboardTable) return

  const socket = new WebSocket('wss://lara-bomb-api.insper.dev/ws/leaderboard')

  socket.addEventListener('open', (event) => {
    console.log('Conectado ao servidor de leaderboard')
  })

  socket.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data)

      if (data.leaderboard) {
        const tbody = leaderboardTable.querySelector('tbody')
        tbody.innerHTML = ''

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

  socket.addEventListener('close', (event) => {
    console.log('Desconectado do servidor de leaderboard')

    setTimeout(initLeaderboard, 5000)
  })

  socket.addEventListener('error', (event) => {
    console.error('Erro no WebSocket do leaderboard:', event)
  })
}

// Smooth scrolling for navigation links
function initSmoothScroll() {
  const linkElements = [
    ...document.querySelectorAll('.nav-link'),
    ...document.querySelectorAll('.btn-link'),
  ]

  linkElements.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault()

      const targetId = link.getAttribute('href')
      const targetElement = document.querySelector(targetId)

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth',
        })
      }
    })
  })
}

// Mobile navigation toggle
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

// Detect user's operating system and initialize downloads
function initDownloads() {
  const userOS = {
    Windows: /Win/i.test(navigator.userAgent),
    MacOS: /Mac/i.test(navigator.userAgent),
    Linux: /Linux|X11/i.test(navigator.userAgent),
  }

  const windowsBtn = document.getElementById('download-windows')
  const linuxBtn = document.getElementById('download-linux')
  const macosBtn = document.getElementById('download-macos')

  const apiUrl =
    'https://api.github.com/repos/insper-dev/lara-bomb/releases/latest'

  const highlightUserCard = () => {
    const osType = userOS.Windows ? 'windows' : userOS.MacOS ? 'macos' : 'linux'
    const userCard = document.querySelector(
      `.download-card[data-os="${osType}"]`
    )
    if (userCard) {
      userCard.classList.add('download-card-highlight')
    }
  }

  highlightUserCard()

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then((data) => {
      // Check if release is less than 30 days old (yep :D)
      const releaseDate = new Date(data.published_at)
      const currentDate = new Date()
      const diffDays = Math.ceil(
        (currentDate - releaseDate) / (1000 * 60 * 60 * 24)
      )
      const isNewRelease = diffDays <= 30

      const version = data.tag_name

      const assets = data.assets
      const assetMapping = {
        'lara-bomb.exe': {
          btn: windowsBtn,
          container: document.querySelector('[data-os="windows"]'),
        },
        'lara-bomb-linux': {
          btn: linuxBtn,
          container: document.querySelector('[data-os="linux"]'),
        },
        'lara-bomb-macos': {
          btn: macosBtn,
          container: document.querySelector('[data-os="macos"]'),
        },
      }

      assets.forEach((asset) => {
        const mapping = assetMapping[asset.name]
        if (mapping) {
          const { btn, container } = mapping

          btn.classList.remove('btn-disabled')
          btn.classList.add('btn-primary')
          btn.innerHTML = `<i data-lucide="download"></i> Download ${version}`
          btn.addEventListener('click', () => {
            window.location.href = asset.browser_download_url
          })

          if (isNewRelease) {
            const badgeContainer = container.querySelector(
              '.new-release-container'
            )
            const badge = document.createElement('span')
            badge.className = 'new-release-badge'
            badge.textContent = 'Novo!'
            badgeContainer.appendChild(badge)
          }
        }
      })

      // precisa reinicializar os ícones.
      lucide.createIcons()
    })
    .catch((error) => {
      console.error('Error fetching release data:', error)

      const downloadSection = document.getElementById('download')
      if (downloadSection) {
        const errorMessage = document.createElement('p')
        errorMessage.className = 'download-error'
        errorMessage.innerHTML =
          '<i data-lucide="alert-circle"></i> Não foi possível carregar as informações de download. Por favor, tente novamente mais tarde.'
        downloadSection.querySelector('.container').appendChild(errorMessage)
        lucide.createIcons()
      }
    })
}
