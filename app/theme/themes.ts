export type ThemeName = "red" | "blue" | "yellow";

type Tone = Record<"--primary" | "--primary-foreground", string>;

//Todo themes needs to add more and make it persist with the user in database and in local storage
export const themes: Record<ThemeName, { light: Tone; dark: Tone }> = {
  red: {
    light: {
      "--primary": "0 72.2% 50.6%",
      "--primary-foreground": "0 85.7% 97.3%",
    },
    dark: {
      "--primary": "0 85% 60%",
      "--primary-foreground": "0 0% 100%",
    },
  },
  blue: {
    light: {
      "--primary": "221.2 83.2% 53.3%",
      "--primary-foreground": "210 40% 98%",
    },
    dark: {
      "--primary": "217.2 100% 50%",
      "--primary-foreground": "210 20% 98%",
    },
  },
  yellow: {
    light: {
      "--primary": "47.9 95.8% 53.1%",
      "--primary-foreground": "26 83.3% 14.1%",
    },
    dark: {
      "--primary": "47.9 100% 45%",
      "--primary-foreground": "26 95% 10%",
    },
  },
};
