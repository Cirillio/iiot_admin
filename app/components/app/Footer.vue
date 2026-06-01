<script lang="ts" setup>
import { branchIcon, githubIcon, menuIcon } from "~/core/icons-map";

const { isFluid } = useLayout();
const mc_modal_open = ref(false);

const realtime = useRealTimeStore();
const commands = useCommandsStore();
const signalR = useSignalR();
const control = useControlHub();

const { autoconnect } = signalR;

const toggleMetrics = () =>
  realtime.isConnected ? signalR.disconnect() : signalR.connect();
const toggleControl = () =>
  commands.isConnected ? control.disconnect() : control.connect();

// Включение autoconnect поднимает оба канала немедленно (на старте это делает plugin/signalr).
watch(autoconnect, (on) => {
  if (!on) return;
  if (!realtime.isConnected) signalR.connect();
  if (!commands.isConnected) control.connect();
});

const version = "v1.4.2-build.89";
const env = "Development";
const currentYear = new Date().getFullYear();
</script>

<template>
  <CustomCard>
    <footer
      class="flex items-center w-full justify-between px-6 py-2 bg-default/5"
    >
      <div class="flex items-center gap-4 text-xs text-default/75 font-sans">
        <!-- Inline (wide layout): switch + both channels -->
        <div v-if="isFluid" class="flex uppercase items-center gap-4">
          <div class="flex gap-2 items-center">
            <span>Autoconnect:</span>
            <USwitch v-model="autoconnect" size="xs" />
          </div>

          <AppChannelStatus
            label="Metrics"
            :connected="realtime.isConnected"
            @toggle="toggleMetrics"
          />
          <AppChannelStatus
            label="Control"
            :connected="commands.isConnected"
            @toggle="toggleControl"
          />
        </div>

        <!-- Compact (narrow layout): modal with both channels -->
        <UModal v-else v-model:open="mc_modal_open">
          <UButton
            size="xs"
            label="connections"
            variant="subtle"
            :color="
              realtime.isConnected && commands.isConnected
                ? 'success'
                : 'warning'
            "
            :trailing-icon="menuIcon"
          />
          <template #content>
            <div class="flex flex-col gap-4">
              <div
                class="border-b font-mono border-default p-4 text-center font-bold text-2xl text-secondary"
              >
                Manage Connections
              </div>
              <div class="flex p-8 flex-col gap-6 text-sm">
                <div class="flex gap-2 items-center">
                  <span>Autoconnect:</span>
                  <USwitch v-model="autoconnect" size="xl" class="ml-auto" />
                </div>

                <AppChannelStatus
                  label="Metrics Channel"
                  size="lg"
                  :connected="realtime.isConnected"
                  @toggle="toggleMetrics"
                />
                <AppChannelStatus
                  label="Control Channel"
                  size="lg"
                  :connected="commands.isConnected"
                  @toggle="toggleControl"
                />
              </div>
              <div class="p-8 border-t border-default">
                <UButton
                  block
                  variant="outline"
                  color="neutral"
                  size="xl"
                  label="Close"
                  @click="mc_modal_open = false"
                />
              </div>
            </div>
          </template>
        </UModal>

        <div class="h-3 w-px bg-default/20" />

        <div class="flex uppercase items-center gap-1">
          <span>Env:</span>
          <span
            class="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold tracking-wider"
          >
            {{ env }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-4 text-xs text-default/60">
        <div class="flex items-center gap-1">
          <UIcon :name="branchIcon" class="size-4" />
          <span>{{ version }}</span>
        </div>

        <div class="h-3 w-px bg-default/20" />

        <div class="flex items-center gap-2 text-xs font-medium">
          <span>&copy; {{ currentYear }} IIoT Admin</span>
          <a
            title="GitHub Repository"
            href="https://github.com/Cirillio/iiot_admin"
            target="_blank"
            class="p-1.5 hover:bg-primary/75 transition hover:text-white items-center justify-center bg-muted/50 rounded-full flex"
          >
            <UIcon :name="githubIcon" class="size-5" />
          </a>
        </div>
      </div>
    </footer>
  </CustomCard>
</template>
