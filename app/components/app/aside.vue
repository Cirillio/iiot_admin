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
              base: 'text-base',
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
            color="neutral"
            :icon="settingsIcon"
            :ui="{
              base: '*:size-6',
            }"
          />
        </custom-tooltip>
        <custom-tooltip
          text="Logout"
          size="md"
          :content="{
            side: 'right',
          }"
          :delay-duration="100"
        >
          <u-button
            variant="ghost"
            :ui="{
              base: 'rotate-y-180',
            }"
            :icon="logoutIcon"
            color="error"
          />
        </custom-tooltip>
      </template>
      <template v-else>
        <u-button
          variant="ghost"
          to="/settings"
          :icon="settingsIcon"
          label="Settings"
          color="neutral"
          :ui="{
            leadingIcon: 'size-6',
            base: 'text-base',
          }"
        />
        <u-button
          variant="ghost"
          :icon="logoutIcon"
          label="Logout"
          color="error"
          :ui="{
            leadingIcon: 'size-6',
            base: 'text-base',
          }"
        />
      </template>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import type { ButtonProps } from "@nuxt/ui";
import {
  appLogoIcon,
  chartIcon,
  devicesIcon,
  fileIcon,
  logoutIcon,
  sensorIcon,
  settingsIcon,
  systemIcon,
} from "~/core/icons-map";

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
    icon: appLogoIcon,
    color: "primary",
  },
  {
    label: "Devices",
    to: "/devices",
    icon: devicesIcon,
    color: "secondary",
  },
  {
    label: "Sensors",
    to: "/sensors",
    icon: sensorIcon,
    color: "secondary",
  },
  {
    label: "Analytics",
    to: "/analytics",
    icon: chartIcon,
    color: "secondary",
  },
  {
    label: "Systems Status",
    to: "/systems-status",
    icon: systemIcon,
    color: "neutral",
  },
  {
    label: "Logs",
    to: "/logs",
    icon: fileIcon,
    color: "neutral",
  },
];
</script>
