<script lang="ts" setup>
import {
  checkIcon,
  deleteIcon,
  notificationActiveIcon,
  notificationIcon,
} from "~/core/icons-map";

const notifications = useNotificationsStore();
</script>

<template>
  <UPopover
    :content="{
      align: 'end',
    }"
    @update:open="(v) => v && notifications.markAllRead()"
  >
    <CustomTooltip
      text="Notifications"
      :content="{ align: 'end' }"
      :delay-duration="150"
    >
      <UChip
        :color="notifications.hasUnreadErrors ? 'error' : 'warning'"
        :show="notifications.unreadCount > 0"
        size="xl"
      >
        <UButton
          :icon="
            notifications.unreadCount > 0
              ? notificationActiveIcon
              : notificationIcon
          "
          variant="ghost"
          color="neutral"
        />
      </UChip>
    </CustomTooltip>

    <template #content>
      <div class="w-80 flex flex-col font-mono">
        <div
          class="flex items-center justify-between px-4 py-2.5 border-b border-default"
        >
          <span class="text-sm font-bold uppercase tracking-wider"
            >Notifications</span
          >
          <div class="flex gap-1">
            <UButton
              :icon="checkIcon"
              size="xs"
              variant="ghost"
              color="neutral"
              @click="notifications.markAllRead()"
            />
            <UButton
              :icon="deleteIcon"
              size="xs"
              variant="ghost"
              color="neutral"
              @click="notifications.clearAll()"
            />
          </div>
        </div>

        <div
          v-if="notifications.items.length === 0"
          class="px-4 py-6 text-center text-sm text-muted"
        >
          No notifications
        </div>

        <div
          v-else
          class="flex flex-col max-h-80 overflow-y-auto divide-y divide-default"
        >
          <div
            v-for="n in notifications.items.slice(0, 10)"
            :key="n.id"
            class="flex gap-3 px-4 py-3 items-start transition"
            :class="n.read ? 'opacity-50' : ''"
          >
            <div
              class="mt-1 size-2 rounded-full shrink-0"
              :class="{
                'bg-error': n.level === 'CRITICAL',
                'bg-warning': n.level === 'WARNING',
                'bg-info': n.level === 'INFO',
                'bg-success': n.level === 'SUCCESS',
              }"
            />
            <div class="flex flex-col gap-0.5 flex-1 min-w-0">
              <span class="text-xs font-bold leading-tight truncate">{{
                n.title
              }}</span>
              <span class="text-xs text-muted leading-snug">{{
                n.message
              }}</span>
              <span class="text-[10px] text-muted/60 mt-0.5">{{
                new Date(n.date).toLocaleTimeString()
              }}</span>
            </div>
            <UButton
              :icon="deleteIcon"
              size="xs"
              variant="ghost"
              color="neutral"
              class="shrink-0"
              @click="notifications.dismiss(n.id)"
            />
          </div>
        </div>

        <div
          v-if="notifications.items.length > 0"
          class="border-t border-default px-4 py-2"
        >
          <UButton
            to="/logs"
            block
            variant="ghost"
            color="neutral"
            size="xs"
            label="View all logs"
          />
        </div>
      </div>
    </template>
  </UPopover>
</template>
