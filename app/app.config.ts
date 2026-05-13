export default defineAppConfig({
  ui: {
    colors: {
      primary: "red",
      neutral: "mist",
      tertiary: "emerald",
    },
    popover: {
      slots: {
        content:
          "data-[state=open]:animate-[scale-in_150ms_ease-in] data-[state=closed]:animate-[scale-out_0ms_ease-in]",
      },
    },
    button: {
      slots: {
        base: "cursor-pointer",
      },
    },
    toaster: {
      defaultVariants: {
        position: "top-center",
      },
    },
  },
});
