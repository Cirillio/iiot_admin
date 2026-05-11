<script lang="ts" setup>
import { branchIcon, githubIcon, menuIcon } from "~/core/icons-map";

const { isFluid } = useLayout();
const mc_modal_open = ref(false);
const realtime = useRealTimeStore();
const signalR = useSignalR();

const { autoconnect } = signalR;

const version = "v1.4.2-build.89";
const env = "Development";
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer
    class="border-t border-default flex items-center justify-between px-6 py-2 bg-default/5"
  >
    <div class="flex items-center gap-4 text-xs text-default/75 font-sans">
      <div v-if="isFluid" class="flex uppercase items-center gap-1.5">
        <div class="flex gap-2 items-center">
          <span>Autoconnect:</span>
          <USwitch v-model="autoconnect" size="xs" />
        </div>

        <div class="flex gap-2 items-center">
          <span
            class="size-1.5 animate-pulse rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]"
          />
          <span>Metrics Channel:</span>
          <span
            class="font-medium"
            :class="[realtime.isConnected ? 'text-success' : 'text-error-500']"
          >
            {{ realtime.isConnected ? "Connected" : "Disconnected" }}
          </span>
          <UButton
            :label="realtime.isConnected ? 'disconnect' : 'connect'"
            size="xs"
            variant="outline"
            color="neutral"
            @click="
              () => {
                realtime.isConnected ? signalR.disconnect() : signalR.connect();
              }
            "
          />
        </div>
      </div>
      <UModal v-else v-model:open="mc_modal_open">
        <UButton
          size="xs"
          label="connections"
          variant="subtle"
          color="warning"
          :trailing-icon="menuIcon"
        />
        <template #content>
          <div class="flex flex-col gap-4">
            <div
              class="border-b font-mono border-default p-4 text-center font-bold text-2xl text-secondary"
            >
              Manage Connections
            </div>
            <div class="flex p-8 flex-col gap-8">
              <div class="flex gap-2 items-center">
                <span>Autoconnect:</span>
                <USwitch v-model="autoconnect" size="xl" class="ml-auto" />
              </div>
              <div class="flex gap-2 items-center">
                <span
                  class="size-1.5 animate-pulse rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                />
                <span>Metrics Channel:</span>
                <span
                  class="font-medium"
                  :class="[
                    realtime.isConnected ? 'text-success' : 'text-error-500',
                  ]"
                >
                  {{ realtime.isConnected ? "Connected" : "Disconnected" }}
                </span>
                <UButton
                  :label="realtime.isConnected ? 'disconnect' : 'connect'"
                  size="lg"
                  variant="outline"
                  color="neutral"
                  class="ml-auto"
                  @click="
                    () => {
                      realtime.isConnected
                        ? signalR.disconnect()
                        : signalR.connect();
                    }
                  "
                />
              </div>
            </div>
            <div class="p-8 border-t border-default">
              <UButton
                block
                variant="outline"
                color="neutral"
                size="xl"
                label="Close"
                @click="
                  () => {
                    mc_modal_open = false;
                  }
                "
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
</template>
