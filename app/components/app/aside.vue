<template>
  <aside class="h-full flex flex-col">
    <nav class="flex flex-col h-fit p-4 gap-4">
      <template
        v-for="(item, index) in asideNavItems"
        :key="item.label + item.icon"
      >
        <template v-if="!isFluid">
          <custom-tooltip
            size="md"
            :text="item.label"
            :content="{
              side: 'right',
            }"
            :delay-duration="100"
          >
            <u-button
              :icon="item.icon"
              :color="item.color"
              :to="item.to"
              :ui="{
                base: '*:size-6',
              }"
              variant="ghost"
              active-variant="solid"
            />
          </custom-tooltip>
        </template>
        <template v-else>
          <u-button
            :leading-icon="item.icon"
            :color="item.color"
            :label="item.label"
            :to="item.to"
            variant="ghost"
            active-variant="solid"
            :ui="{
              leadingIcon: 'size-6',
              base: 'text-sm',
            }"
          />
        </template>
        <u-separator
          v-if="
            item.color !== asideNavItems[index + 1]?.color &&
            index !== asideNavItems.length - 1
          "
        />
      </template>
    </nav>

    <div class="flex flex-col p-4 mt-auto gap-4">
      <template v-if="!isFluid">
        <custom-tooltip
          text="Change theme"
          size="md"
          :content="{
            side: 'right',
          }"
          :delay-duration="100"
        >
          <app-theme-button
            :ui="{
              base: '*:size-6',
            }"
          />
        </custom-tooltip>
        <custom-tooltip
          text="Settings"
          size="md"
          :content="{
            side: 'right',
          }"
          :delay-duration="100"
        >
          <u-button
            variant="ghost"
            to="/settings"
            :icon="icons.settings"
            :ui="{
              base: '*:size-6',
            }"
          />
        </custom-tooltip>
      </template>
      <template v-else>
        <app-theme-button
          :ui="{
            leadingIcon: 'size-6',
            base: 'text-sm',
          }"
          label="Change Theme"
        />
        <u-button
          variant="ghost"
          to="/settings"
          :icon="icons.settings"
          label="Settings"
          :ui="{
            leadingIcon: 'size-6',
            base: 'text-sm',
          }"
        />
      </template>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import type { ButtonProps } from "@nuxt/ui";
import { icons } from "~/core/icons-map";

const { isFluid } = useLayout();

const asideNavItems: {
  label: string;
  to: string;
  icon: string;
  color: ButtonProps["color"];
}[] = [
  {
    label: "Dashboard",
    to: "/",
    icon: icons.appLogo,
    color: "primary",
  },
  {
    label: "Devices",
    to: "/devices",
    icon: icons.devices,
    color: "secondary",
  },
  {
    label: "Sensors",
    to: "/sensors",
    icon: icons.sensor,
    color: "secondary",
  },
  {
    label: "System Status",
    to: "/system-status",
    icon: icons.system,
    color: "neutral",
  },
  {
    label: "Logs",
    to: "/logs",
    icon: icons.file,
    color: "neutral",
  },
];
</script>

<style></style>
