<template>
  <v-card>
    <v-card-title>{{ $t('polling.controls.title') }}</v-card-title>

    <v-card-text>
      <v-row align="center">
        <v-col cols="auto">
          <v-chip :color="isRunning ? 'success' : 'grey'" :text="isRunning ? $t('polling.status.running') : $t('polling.status.stopped')" />
        </v-col>

        <v-col cols="auto">
          <span>{{ $t('polling.currentScanner') }}: <strong>{{ currentScannerId || $t('polling.none') }}</strong></span>
        </v-col>

        <v-col cols="auto">
          <v-btn color="primary" :disabled="isRunning" @click="handleStart">{{ $t('polling.start') }}</v-btn>
          <v-btn class="ml-2" color="error" :disabled="!isRunning" @click="handleStop">{{ $t('polling.stop') }}</v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useScannerStore } from '@/stores/scannerStore'

  const scannerStore = useScannerStore()
  const isRunning = computed(() => scannerStore.isPollingRunning)
  const currentScannerId = computed(() => scannerStore.currentScannerId)

  async function handleStart () {
    try {
      await scannerStore.startPollingService()
    } catch (error) {
      console.error(error)
    }
  }

  async function handleStop () {
    try {
      await scannerStore.stopPollingService()
    } catch (error) {
      console.error(error)
    }
  }
</script>
