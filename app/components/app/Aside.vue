<template>
  <custom-card>
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
                  base: '*:size-5',
                }"
                variant="ghost"
                active-variant="subtle"
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
              active-variant="subtle"
              :ui="{
                leadingIcon: 'size-5',
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
                base: '*:size-5',
              }"
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
              leadingIcon: 'size-5',
              base: 'text-sm',
            }"
          />
        </template>
      </div>
    </aside>
  </custom-card>
</template>

<script lang="ts" setup>
import type { ButtonProps } from "@nuxt/ui";
import {
  appLogoIcon,
  chartIcon,
  connectionIcon,
  controlIcon,
  databaseIcon,
  devicesIcon,
  fileIcon,
  tagIcon,
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
    label: "Connections",
    to: "/connections",
    icon: connectionIcon,
    color: "secondary",
  },
  {
    label: "Tags",
    to: "/tags",
    icon: tagIcon,
    color: "secondary",
  },
  {
    label: "Control",
    to: "/control",
    icon: controlIcon,
    color: "secondary",
  },
  {
    label: "Analytics",
    to: "/analytics",
    icon: chartIcon,
    color: "secondary",
  },
  {
    label: "Raw Data",
    to: "/data",
    icon: databaseIcon,
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
