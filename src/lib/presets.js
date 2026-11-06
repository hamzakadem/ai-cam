export const PRESETS = [
  {
    id: 'auto',
    title: 'Auto Enhance',
    tag: 'BALANCED',
    description: 'Upscale, recover detail, and balance the full frame.',
    instruction:
      'Perform a natural professional enhancement: improve exposure, white balance, dynamic range, micro-contrast, sharpness, and perceived resolution. Reduce noise and compression artifacts without making the result look artificial.',
  },
  {
    id: 'studio',
    title: 'Studio Lighting',
    tag: 'PORTRAIT',
    description: 'Soft key light, controlled highlights, clean skin tones.',
    instruction:
      'Apply refined studio lighting with a soft directional key, gentle fill, controlled highlights, natural skin tones, and subtle subject separation. Preserve facial identity and realistic skin texture.',
  },
  {
    id: 'color',
    title: 'Color Correction',
    tag: 'TRUE TONE',
    description: 'Neutral whites and accurate, confident color.',
    instruction:
      'Correct color cast, white balance, saturation, and tonal contrast. Recover highlight and shadow color while keeping hues accurate, neutral, and photographic.',
  },
  {
    id: 'cinematic',
    title: 'Cinematic Look',
    tag: 'FILM',
    description: 'Sculpted contrast with a restrained film finish.',
    instruction:
      'Create a premium cinematic grade with sculpted contrast, gently rolled highlights, rich but controlled color separation, subtle film texture, and dimensional lighting. Avoid heavy filters or crushed detail.',
  },
]

export function createEnhancementPrompt(presetId, customPrompt) {
  const preset = PRESETS.find((item) => item.id === presetId) || PRESETS[0]
  const custom = customPrompt.trim()

  return [
    'Edit the supplied source photo into a polished, high-resolution final image.',
    preset.instruction,
    custom ? `Additional direction from the user: ${custom}` : '',
    'Preserve the original subject, identity, pose, framing, scene geometry, and important text unless the user explicitly asks to change them.',
    'Do not add a border, watermark, caption, comparison layout, or explanatory text.',
    'Return the completed edited image using the image_generation tool.',
  ]
    .filter(Boolean)
    .join('\n\n')
}
