// Realistic, theme-aware SVG art for the guided how-to walkthroughs.
// Scenes are built as SVG strings (designed + validated in a preview harness)
// and injected via dangerouslySetInnerHTML. All colors come from CSS custom
// properties so the same art renders correctly on clinical (dark) and
// clinical-light.

export type LabTheme = 'clinical' | 'clinical-light';

export function guideThemeVars(theme: LabTheme, accent: string): React.CSSProperties {
  const light = theme === 'clinical-light';
  const v: Record<string, string> = light
    ? {
        '--surface': '#ffffff', '--panel': '#eef2f7', '--text': '#0f172a', '--muted': '#516079', '--line': '#c2ccd8',
        '--glass': '#e6ecf3', '--metal': '#aab6c6', '--metalHi': '#ffffff', '--metalD': '#7c8aa0',
        '--stopper': '#9aa7b8', '--plunger': '#8996a8', '--plungerD': '#5f6b7d',
        '--liquid': '#22a7dd', '--liquidHi': '#8fd6f2',
        '--skin': '#eab98f', '--skin2': '#d6a06f', '--fat': '#f4dca6', '--fatHi': '#fbedc8', '--muscle': '#c56b7e', '--muscleHi': '#d68595',
      }
    : {
        '--surface': '#0b1222', '--panel': '#0f172a', '--text': '#e8eefb', '--muted': '#93a7c4', '--line': '#3a4a63',
        '--glass': '#141f36', '--metal': '#d5dce6', '--metalHi': '#f4f7fb', '--metalD': '#6b7a92',
        '--stopper': '#8b98ab', '--plunger': '#4a586e', '--plungerD': '#2f3b4e',
        '--liquid': '#2fb6e6', '--liquidHi': '#7fd8f5',
        '--skin': '#e8b98f', '--skin2': '#d19b6f', '--fat': '#f2d59e', '--fatHi': '#f8e6c2', '--muscle': '#b5566a', '--muscleHi': '#c96f82',
      };
  v['--accent'] = accent;
  return v as React.CSSProperties;
}
