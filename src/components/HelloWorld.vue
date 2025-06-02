<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
// import '../style.css'

interface ApodData {
  title: string
  explanation: string
  url: string
  hdurl?: string
  media_type: string
  date: string
  copyright?: string
}

const apodData = ref<ApodData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showDetails = ref(false)

// Define apiKey at the top-level so it's accessible everywhere
const apiKey = import.meta.env.VITE_NASA_API_KEY || "main"

const getData = async () => {
  const url = "https://api.nasa.gov/planetary/apod"

  try {
    loading.value = true
    const response = await fetch(`${url}?api_key=${apiKey}`)
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`)
    }

    const json = await response.json()
    apodData.value = json
    console.log(json)
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message
      console.error(err.message)
    } else {
      error.value = 'An unknown error occurred'
      console.error(err)
    }
  } finally {
    loading.value = false
  }
}

const getRandomApod = async () => {
  const url = "https://api.nasa.gov/planetary/apod"

  try {
    loading.value = true
    const response = await fetch(`${url}?api_key=${apiKey}&count=1`)
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`)
    }

    const json = await response.json()
    apodData.value = json[0]
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = 'An unknown error occurred'
    }
  } finally {
    loading.value = false
  }
}

const imageUrl = computed(() => {
  if (!apodData.value) return ''
  return apodData.value.hdurl || apodData.value.url
})

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

onMounted(() => {
  getData()

  console.log("Apikey:", apiKey);
})
</script>

<template>
  <div class="cosmic-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="cosmic-loader">
        <div class="star"></div>
        <div class="star"></div>
        <div class="star"></div>
      </div>
      <p class="loading-text">Fetching cosmic wonders...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">🌌</div>
      <h2>Oops! Lost in space</h2>
      <p>{{ error }}</p>
      <button @click="getData" class="retry-btn">Try Again</button>
    </div>

    <!-- Main Content -->
    <div v-else-if="apodData" class="apod-display">
      <!-- Background Image -->
      <div v-if="apodData.media_type === 'image'" class="background-image"
        :style="{ backgroundImage: `url('${imageUrl}')` }"></div>

      <!-- Video Background -->
      <div v-else class="video-background">
        <iframe :src="apodData.url" frameborder="0" allowfullscreen class="cosmic-video"></iframe>
      </div>

      <!-- Overlay Content -->
      <div class="overlay-content">
        <div class="title-section">
          <h1 class="cosmic-title" @click="toggleDetails">
            {{ apodData.title }}
          </h1>
          <p class="cosmic-date">{{ new Date(apodData.date).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          }) }}</p>
        </div>

        <!-- Details Panel -->
        <div v-if="showDetails" class="details-panel">
          <div class="explanation">
            <p>{{ apodData.explanation }}</p>
          </div>
          <div v-if="apodData.copyright" class="copyright">
            <p>© {{ apodData.copyright }}</p>
          </div>
        </div>

        <!-- Controls -->
        <div class="controls">
          <button @click="toggleDetails" class="control-btn">
            {{ showDetails ? '✨ Hide Details' : '🔍 Explore' }}
          </button>
          <button @click="getRandomApod" class="control-btn random-btn">
            🎲 Random Wonder
          </button>
          <button @click="getData" class="control-btn">
            🔄 Today's Image
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.cosmic-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
  font-family: 'Arial', sans-serif;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
}

.cosmic-loader {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.star {
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  animation: twinkle 1.5s ease-in-out infinite;
}

.star:nth-child(2) {
  animation-delay: 0.3s;
}

.star:nth-child(3) {
  animation-delay: 0.6s;
}

.loading-text {
  color: #fff;
  font-size: 1.2rem;
  opacity: 0.8;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #fff;
  text-align: center;
  padding: 20px;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.retry-btn {
  margin-top: 20px;
  padding: 12px 24px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

/* Main Display */
.apod-display {
  position: relative;
  width: 100%;
  height: 100%;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: brightness(0.7);
  animation: slowZoom 20s ease-in-out infinite alternate;
}

.video-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.cosmic-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px;
  background: linear-gradient(transparent 0%,
      rgba(0, 0, 0, 0.1) 30%,
      rgba(0, 0, 0, 0.3) 70%,
      rgba(0, 0, 0, 0.8) 100%);
}

.title-section {
  text-align: center;
  margin-top: 60px;
}

.cosmic-title {
  font-size: clamp(2rem, 5vw, 4rem);
  color: #fff;
  text-shadow: 2px 2px 20px rgba(0, 0, 0, 0.8);
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  line-height: 1.2;
}

.cosmic-title:hover {
  transform: scale(1.02);
  text-shadow: 2px 2px 30px rgba(255, 255, 255, 0.3);
}

.cosmic-date {
  color: #e0e0e0;
  font-size: 1.1rem;
  opacity: 0.9;
  text-shadow: 1px 1px 10px rgba(0, 0, 0, 0.8);
}

.details-panel {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  margin: 20px 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideUp 0.5s ease-out;
  max-height: 60vh;
  overflow-y: auto;
}

.explanation {
  color: #f0f0f0;
  line-height: 1.6;
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.copyright {
  color: #b0b0b0;
  font-style: italic;
  font-size: 0.9rem;
  text-align: right;
}

.controls {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.control-btn {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  min-width: 140px;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.random-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: none;
}

.random-btn:hover {
  background: linear-gradient(45deg, #764ba2, #667eea);
}

/* Animations */
@keyframes twinkle {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.3;
    transform: scale(0.8);
  }
}

@keyframes slowZoom {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(1.05);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .overlay-content {
    padding: 20px;
  }

  .controls {
    flex-direction: column;
    align-items: center;
  }

  .control-btn {
    width: 100%;
    max-width: 250px;
  }

  .details-panel {
    padding: 20px;
    margin: 10px 0;
    max-height: 50vh;
  }
}

/* Custom Scrollbar */
.details-panel::-webkit-scrollbar {
  width: 6px;
}

.details-panel::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.details-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.details-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>