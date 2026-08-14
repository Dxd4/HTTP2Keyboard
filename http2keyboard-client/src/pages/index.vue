<template>
  <v-card class="mx-auto pa-2" rounded="lg" width="600">
    <v-card-title class="text-h5 font-weight-bold d-flex align-center">
      <v-icon class="mr-3" color="primary" icon="mdi-keyboard-outline" size="32" />
      <span>HTTP2Keyboard</span>
      <v-spacer />
    </v-card-title>

    <v-card-subtitle class="text-subtitle-1 text-medium-emphasis pb-2">
      Select a scanner to forward barcode data as keyboard input
    </v-card-subtitle>

    <v-divider class="mx-3" />

    <v-card-text class="pa-0">
      <v-list class="pa-2" lines="two">
        <v-list-item
          v-for="scanner in availableScanners"
          :key="scanner.id"
          :active="isScannerActive(scanner.id)"
          class="mb-1"
          :color="isScannerActive(scanner.id) ? 'primary' : undefined"
          rounded="lg"
          @click="onScannerClick(scanner.id)"
        >
          <template #prepend>
            <v-avatar :color="isScannerActive(scanner.id) ? 'primary' : 'grey-lighten-2'" size="40">
              <v-icon
                :color="isScannerActive(scanner.id) ? 'white' : 'grey-darken-2'"
                :icon="isScannerActive(scanner.id) ? 'mdi-barcode-scan' : 'mdi-barcode'"
                size="24"
              />
            </v-avatar>
          </template>

          <v-list-item-title class="font-weight-medium">
            {{ scanner.path }}
            <v-chip
              v-if="isScannerActive(scanner.id)"
              class="ml-2"
              color="primary"
              label
              size="x-small"
              text-color="white"
            >
              active
            </v-chip>
          </v-list-item-title>

          <v-list-item-subtitle>
            Vendor: {{ scanner.vendorId }} · Product: {{ scanner.productId }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>

    <v-divider class="mx-3" />

    <v-card-actions class="d-flex justify-space-between align-center px-4 py-3">
      <div class="text-caption text-medium-emphasis">
        {{ isServiceActive ? 'Service active' : 'Service paused' }}
      </div>

      <v-btn
        :color="isServiceActive ? 'success' : 'grey'"
        :prepend-icon="isServiceActive ? 'mdi-pause' : 'mdi-play'"
        variant="tonal"
        @click="onTogglePollingClick"
      >
        {{ isServiceActive ? 'Pause' : 'Resume' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
  import { storeToRefs } from 'pinia'
  import { useHttp2KeyboardStore } from '@/stores/http2keyboardStore'
  import { useScanner2HttpStore } from '@/stores/scanner2httpStore'
  const scanner2http = useScanner2HttpStore()
  const http2keyboard = useHttp2KeyboardStore()
  scanner2http.init()
  http2keyboard.init()

  const { availableScanners } = storeToRefs(scanner2http)
  const { isServiceActive, activeScannerId } = storeToRefs(http2keyboard)
  const { setActiveScanner, togglePolling } = http2keyboard

  function isScannerActive (id: string) {
    return id === activeScannerId.value
  }

  function onScannerClick (id: string) {
    setActiveScanner(id)
  }

  function onTogglePollingClick () {
    togglePolling()
  }
</script>
