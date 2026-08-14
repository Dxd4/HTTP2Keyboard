<template>
  <v-card>
    <v-card-title>{{ $t('scanners.available.title') }}</v-card-title>

    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="availableScanners"
      >
        <template #item.actions="{ item }">
          <v-btn
            color="primary"
            :disabled="isActive(item.id)"
            size="small"
            @click="handleActivate(item.id)"
          >
            {{ isActive(item.id) ? $t('scanners.available.active') : $t('scanners.available.activate') }}
          </v-btn>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useScannerStore } from '@/stores/scannerStore'

  const scannerStore = useScannerStore()
  const { availableScanners } = scannerStore

  const headers = [
    { title: 'ID', key: 'id' },
    { title: 'Path', key: 'path' },
    { title: 'Vendor ID', key: 'vendorId' },
    { title: 'Product ID', key: 'productId' },
    { title: 'Actions', key: 'actions', sortable: false },
  ]

  const currentScannerId = computed(() => scannerStore.currentScannerId)

  function isActive (id: string): boolean {
    return id === currentScannerId.value
  }

  async function handleActivate (id: string) {
    try {
      await scannerStore.activateScannerById(id)
    } catch (error) {
      console.error(error)
    }
  }
</script>
