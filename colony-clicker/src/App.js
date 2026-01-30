import './App.css'
import { useEffect, useRef, useState } from 'react'
import { TfiGithub } from 'react-icons/tfi'

const COLORS = [
  '#FF0000',
  '#FF7F00',
  '#FFFF00',
  '#00FF00',
  '#0000FF',
  '#4B0082',
  '#9400D3',
  '#000000',
  '#FFFFFF',
]

const LABEL_TYPES = ['numbers', 'dots']
const STORAGE_KEY = 'colonyClickerState'
const ZOOM_STEP = 0.1

function App() {
  // data state
  const [uploaded, setUploaded] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imageDataUrl, setImageDataUrl] = useState(null)
  const [imageName, setImageName] = useState('')
  const [markers, setMarkers] = useState([])
  const [imageDims, setImageDims] = useState({ width: 0, height: 0 })
  const [imageNaturalDims, setImageNaturalDims] = useState({
    width: 0,
    height: 0,
  })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  // settings state
  const [markerColor, setMarkerColor] = useState('#FF0000')
  const [markerType, setMarkerType] = useState('numbers')
  const [markerSize, setMarkerSize] = useState(16)

  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
  })

  const hasImage = Boolean(imageFile || imageDataUrl)

  // key bindings
  useEffect(() => {
    const handleKeydown = (event) => {
      const key = event.key ? event.key.toLowerCase() : ''
      if ((event.ctrlKey || event.metaKey) && key === 'z') {
        event.preventDefault()
        setMarkers((prev) => (prev.length ? prev.slice(0, -1) : prev))
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  // restore state from localStorage on load
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const saved = JSON.parse(raw)
      if (saved?.imageDataUrl) {
        setImageDataUrl(saved.imageDataUrl)
        setImageName(saved.imageName || '')
      }
      if (Array.isArray(saved?.markers)) setMarkers(saved.markers)
      if (typeof saved?.markerColor === 'string') setMarkerColor(saved.markerColor)
      if (typeof saved?.markerType === 'string') setMarkerType(saved.markerType)
      if (typeof saved?.markerSize === 'number') setMarkerSize(saved.markerSize)
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  // persist state to localStorage
  useEffect(() => {
    if (!imageDataUrl) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    const payload = {
      imageDataUrl,
      imageName,
      markers,
      markerColor,
      markerType,
      markerSize,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [imageDataUrl, imageName, markers, markerColor, markerType, markerSize])

  // read the uploaded image file into a data URL
  useEffect(() => {
    if (!imageFile) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setImageDataUrl(event.target.result)
    }
    reader.readAsDataURL(imageFile)
  }, [imageFile])

  // create img element when user inputs an image file or restores data URL
  useEffect(() => {
    const imageStage = document.getElementById('imageStage')
    if (!imageStage || uploaded || !imageDataUrl) return

    const existingImg = imageStage.querySelector('img')
    if (existingImg) imageStage.removeChild(existingImg)

    const img = document.createElement('img')
    img.draggable = false

    img.onload = () => {
      img.classList.add('obj')
      img.file = imageFile
      setImageNaturalDims({ width: img.naturalWidth, height: img.naturalHeight })

      img.style.borderRadius = '8px'
      imageStage.appendChild(img)
      sizeImage()
      setUploaded(true)
    }

    img.src = imageDataUrl
  }, [imageDataUrl, uploaded, imageFile])

  // keep image scaled to the browser window/container
  useEffect(() => {
    if (!imageDataUrl) return
    const handleResize = () => sizeImage()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [imageDataUrl])

  // keep zoom within bounds
  useEffect(() => {
    const maxZoom = getMaxZoom()
    if (zoom > maxZoom) setZoom(maxZoom)
    const minZoom = getMinZoom()
    if (zoom < minZoom) setZoom(minZoom)
  }, [imageDims, imageNaturalDims, zoom])

  const handleClick = (event) => {
    if (dragRef.current.moved) return
    if (imageDims.width === 0 || imageDims.height === 0) return

    const rect = getStageRect()
    if (!rect) return

    if (
      withinBounds(
        event.clientX,
        event.clientY,
        rect.left,
        rect.right,
        rect.top,
        rect.bottom
      )
    ) {
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height
      setMarkers((prev) => [
        ...prev,
        {
          value: prev.length + 1,
          x,
          y,
        },
      ])
    }
  }

  // resets marker state
  const handleClearLabels = () => {
    setMarkers([])
  }

  // discards image and resets all state
  const handleRestart = () => {
    setUploaded(false)
    setImageFile(null)
    setImageDataUrl(null)
    setImageName('')
    setMarkers([])
    setImageDims({ width: 0, height: 0 })
    setImageNaturalDims({ width: 0, height: 0 })
    setZoom(1)
    setPan({ x: 0, y: 0 })
    localStorage.removeItem(STORAGE_KEY)
  }

  // downloads the image with markers as a PNG
  const handleDownload = () => {
    if (imageDims.width === 0 || imageDims.height === 0) return
    const imageContainer = document.getElementById('imageContainer')
    if (!imageContainer) return

    const img = imageContainer.querySelector('img')
    if (!img) return

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(imageDims.width)
    canvas.height = Math.round(imageDims.height)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    markers.forEach((marker) => {
      const x = marker.x * canvas.width
      const y = marker.y * canvas.height
      if (markerType === 'numbers') {
        ctx.fillStyle = markerColor
        ctx.font = `${markerSize}px monospace`
        ctx.textBaseline = 'top'
        ctx.textAlign = 'left'
        ctx.fillText(String(marker.value), x - markerSize * 0.4, y - markerSize / 2)
      } else if (markerType === 'dots') {
        ctx.fillStyle = markerColor
        ctx.beginPath()
        ctx.arc(x, y, markerSize / 2, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    const name = imageName || imageFile?.name
    const baseName = name ? name.replace(/\.[^/.]+$/, '') : 'colony-clicker'
    const link = document.createElement('a')
    link.download = `${baseName}-labeled.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleZoomIn = () => {
    setZoom((z) => Math.min(getMaxZoom(), roundZoom(z + ZOOM_STEP)))
  }

  const handleZoomOut = () => {
    setZoom((z) => Math.max(getMinZoom(), roundZoom(z - ZOOM_STEP)))
  }

  const handleResetView = () => {
    setPan({ x: 0, y: 0 })
    setZoom(getMinZoom())
  }

  const handleMouseDown = (event) => {
    if (event.target.closest('.App-zoomControls')) return

    const rect = getStageRect()
    if (!rect) return

    if (
      !withinBounds(
        event.clientX,
        event.clientY,
        rect.left,
        rect.right,
        rect.top,
        rect.bottom
      )
    )
      return

    event.preventDefault()
    dragRef.current.active = true
    dragRef.current.moved = false
    dragRef.current.startX = event.clientX
    dragRef.current.startY = event.clientY
    dragRef.current.startPanX = pan.x
    dragRef.current.startPanY = pan.y
  }

  const handleMouseMove = (event) => {
    if (!dragRef.current.active) return
    const dx = event.clientX - dragRef.current.startX
    const dy = event.clientY - dragRef.current.startY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true
    setPan({
      x: dragRef.current.startPanX + dx,
      y: dragRef.current.startPanY + dy,
    })
  }

  const handleMouseUp = () => {
    dragRef.current.active = false
  }

  // sets marker size state after checks
  const handleSizeFont = (size) => {
    const sizeNumber = Number(size)
    if (Number.isNaN(sizeNumber)) return
    const clamped = Math.min(48, Math.max(2, sizeNumber))
    setMarkerSize(clamped)
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploaded(false)
    setImageFile(file)
    setImageName(file.name || '')
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const withinBounds = (x, y, left, right, top, bottom) => {
    return x < right && x > left && y > top && y < bottom
  }

  const isDark = (hex) => {
    const c = hex.substring(1)
    const rgb = parseInt(c, 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = (rgb >> 0) & 0xff

    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b

    return luma < 128
  }

  const getStageRect = () => {
    const imageStage = document.getElementById('imageStage')
    if (!imageStage) return null
    const rect = imageStage.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null
    return rect
  }

  const roundZoom = (value) => Math.round(value * 10) / 10

  const getMaxZoom = () => {
    if (imageDims.width === 0 || imageDims.height === 0) return 1
    if (imageNaturalDims.width === 0 || imageNaturalDims.height === 0) return 1
    const maxW = imageNaturalDims.width / imageDims.width
    const maxH = imageNaturalDims.height / imageDims.height
    const nativeCap = Math.max(1, Math.min(maxW, maxH))
    const maxZoom = Math.max(4, nativeCap)
    return Math.round(maxZoom * 100) / 100
  }

  const getMinZoom = () => {
    if (imageDims.width === 0 || imageDims.height === 0) return 1
    const imageContainer = document.getElementById('imageContainer')
    if (!imageContainer) return 1
    const rect = imageContainer.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return 1
    const minW = rect.width / imageDims.width
    const minH = rect.height / imageDims.height
    const minZoom = Math.max(1, Math.min(minW, minH))
    return Math.round(minZoom * 100) / 100
  }

  const sizeImage = () => {
    const container = document.getElementById('Body-imageContainer')
    const imageContainer = document.getElementById('imageContainer')
    if (!container || !imageContainer) return
    const img = imageContainer.querySelector('img')
    if (!img) return

    const containerRect = container.getBoundingClientRect()
    const containerAR = containerRect.width / containerRect.height
    const imgAR = img.naturalWidth / img.naturalHeight

    let targetWidth = containerRect.width
    let targetHeight = containerRect.height
    if (imgAR < containerAR) {
      targetHeight = containerRect.height
      targetWidth = targetHeight * imgAR
    } else {
      targetWidth = containerRect.width
      targetHeight = targetWidth / imgAR
    }

    img.style.width = `${targetWidth}px`
    img.style.height = `${targetHeight}px`
    setImageDims({ width: targetWidth, height: targetHeight })
  }

  const renderImageSection = () => {
    if (!hasImage) {
      return (
        <input
          id="imageFileInput"
          type="file"
          name="avatar"
          accept="image/png, image/jpeg"
          onChange={handleImageChange}
        />
      )
    }

    return (
      <div
        id="imageContainer"
        className="App-imageContainer"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDragStart={(event) => event.preventDefault()}
      >
        <div className="App-imageStageWrap">
          <div
            id="imageStage"
            className="App-imageStage"
            style={{
              width: imageDims.width,
              height: imageDims.height,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            {markers.map((marker) => {
              const x = marker.x * imageDims.width
              const y = marker.y * imageDims.height
              if (markerType === 'numbers') {
                return (
                  <div
                    key={marker.value}
                    style={{
                      position: 'absolute',
                      pointerEvents: 'none',
                      top: y - markerSize / 2,
                      left: x - markerSize * 0.4,
                      color: markerColor,
                      fontSize: markerSize,
                    }}
                  >
                    {marker.value}
                  </div>
                )
              }

              if (markerType === 'dots') {
                return (
                  <div
                    key={marker.value}
                    style={{
                      position: 'absolute',
                      pointerEvents: 'none',
                      top: y - markerSize / 2,
                      left: x - markerSize / 2,
                      height: markerSize,
                      width: markerSize,
                      borderRadius: markerSize / 2,
                      backgroundColor: markerColor,
                    }}
                  />
                )
              }

              return null
            })}
          </div>
        </div>
        <div className="App-zoomControls">
          <div
            className="App-zoomButton"
            onClick={(event) => {
              event.stopPropagation()
              handleResetView()
            }}
            title="Reset view"
          >
            ↺
          </div>
          <div
            className="App-zoomButton"
            onClick={(event) => {
              event.stopPropagation()
              handleZoomIn()
            }}
          >
            +
          </div>
          <div
            className="App-zoomButton"
            onClick={(event) => {
              event.stopPropagation()
              handleZoomOut()
            }}
          >
            -
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      <div className="TopBanner">
        <div className="TopBanner-title">Colony Clicker</div>
        <div
          className="TopBanner-info"
          onClick={() => window.open('https://github.com/al-exe', '_blank')}
        >
          <TfiGithub /> @al-exe
        </div>
      </div>
      <div className="Body">
        <div className="Body-imageContainer" id="Body-imageContainer">
          {renderImageSection()}
        </div>
        <div className="Body-infoColumn">
          {hasImage ? (
            <div className="InfoColumn">
              <div className="InfoColumn-controls">
                <div className="InfoColumn-section">
                  <div className="InfoColumn-sectionTitle">Actions</div>
                  <div className="InfoColumn-downloadButton" onClick={handleDownload}>
                    Download image
                  </div>
                  <div className="InfoColumn-discardButton" onClick={handleClearLabels}>
                    Clear labels
                  </div>
                  <div className="InfoColumn-discardButton" onClick={handleRestart}>
                    Discard image
                  </div>
                </div>
                <div className="InfoColumn-section">
                  <div className="InfoColumn-sectionTitle">Settings</div>
                  <div className="InfoColumn-settingsRow">
                    <div>Label size</div>
                    <input
                      className="InfoColumn-size"
                      defaultValue={markerSize}
                      onChange={(event) => handleSizeFont(event.target.value)}
                    />
                  </div>
                  <div className="InfoColumn-settings">
                    <div>Label type</div>
                    <div className="InfoColumn-optionsRow">
                      {LABEL_TYPES.map((label) => (
                        <div
                          key={label}
                          className={
                            label === markerType
                              ? 'InfoColumn-typeOptionSelected'
                              : 'InfoColumn-typeOption'
                          }
                          onClick={() => setMarkerType(label)}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="InfoColumn-settings">
                    <div>Label color</div>
                    <div className="InfoColumn-optionsRow">
                      {COLORS.map((color) => (
                        <div
                          key={color}
                          className="InfoColumn-option"
                          style={{ backgroundColor: color }}
                          onClick={() => setMarkerColor(color)}
                        >
                          {markerColor === color && (
                            <div
                              className="optionSelected"
                              style={{
                                backgroundColor: isDark(color) ? '#FFFFFF' : '#000000',
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="InfoColumn-section">
                <div className="InfoColumn-sectionTitle">Count</div>
                <div className="InfoColumn-countSection">{markers.length}</div>
              </div>
            </div>
          ) : (
            'Please upload an image.'
          )}
        </div>
      </div>
    </div>
  )
}

export default App
