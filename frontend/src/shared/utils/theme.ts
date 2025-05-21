import {
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react"

export const pickPalette = (name: string) => {
  const colorPalette = ["red", "blue", "green", "yellow", "purple", "orange"]
  const index = name.charCodeAt(0) % colorPalette.length
  return colorPalette[index]
}

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        "brand": {
          50: { value: "#F1F8E7" },
          100: { value: "#E3F1D0" },
          200: { value: "#C6E3A1" },
          300: { value: "#AAD572" },
          400: { value: "#8DC640" },
          500: { value: "#76A932" },
          600: { value: "#5D8628" },
          700: { value: "#47661E" },
          800: { value: "#2E4314" },
          900: { value: "#19230B" },
          950: { value: "#0B1005" }
        },
        "secondary": {
          50: { value: "#FCEEEF" },
          100: { value: "#F8DDDF" },
          200: { value: "#F0B7BC" },
          300: { value: "#EA959C" },
          400: { value: "#E26F78" },
          500: { value: "#DB4D59" },
          600: { value: "#D02A38" },
          700: { value: "#AE232F" },
          800: { value: "#73171F" },
          900: { value: "#3B0C10" },
          950: { value: "#1E0608" }
        }
      },
      fonts: {
        heading: { value: 'Inter, system-ui, sans-serif'},
        body: { value: 'Inter, system-ui, sans-serif'},
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.brand.500}" },
          contrast: { value: "{colors.brand.100}" },
          fg: { value: "{colors.brand.700}" },
          muted: { value: "{colors.brand.100}" },
          subtle: { value: "{colors.brand.200}" },
          emphasized: { value: "{colors.brand.300}" },
          focusRing: { value: "{colors.brand.500}" },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)