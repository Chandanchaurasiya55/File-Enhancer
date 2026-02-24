// Services data configuration
export const servicesData = [
  {
    id: 'video-compression',
    icon: '🎬',
    title: 'Video Compression',
    description: 'Reduce file sizes by up to 95% without sacrificing visual fidelity. Our advanced algorithms preserve every detail that matters.',
    operation: 'compress',
    fullDescription: 'Our state-of-the-art video compression technology uses advanced codec optimization to significantly reduce file sizes while maintaining exceptional video quality.',
    formats: ['MP4', 'MOV', 'AVI', 'MKV', 'WEBM', 'HEVC'],
    features: [
      'Up to 95% file size reduction',
      'HD and 4K quality preservation',
      'Fast batch processing',
      'Multiple format support'
    ],
    benefits: [
      'Save storage space',
      'Faster uploads and downloads',
      'Better for web sharing',
      'Reduced bandwidth costs'
    ]
  },
  {
    id: 'ai-enhancement',
    icon: '✨',
    title: 'AI Enhancement',
    description: 'Elevate your footage with neural network-powered upscaling, noise reduction, and color grading that rivals professional studios.',
    operation: 'enhance',
    fullDescription: 'Transform your ordinary footage into professional-quality videos using our advanced AI and machine learning algorithms. Automatically enhance colors, reduce noise, and improve overall visual quality.',
    formats: ['JPG', 'PNG', 'WEBP', 'GIF', 'SVG'],
    features: [
      'Neural network-powered enhancement',
      'Automatic noise reduction',
      'Professional color grading',
      'Advanced sharpening'
    ],
    benefits: [
      'Professional results without expertise',
      'Save hours of manual editing',
      'Consistent quality across clips',
      'Works with any video quality'
    ]
  },
  {
    id: 'format-conversion',
    icon: '⚡',
    title: 'Format Conversion',
    description: 'Seamlessly convert between a wide variety of document and office file formats.',
    operation: 'convert',
    fullDescription: 'Select the conversion type you need, then upload your file to get it converted instantly.',
    // list of conversion pairs offered by this service
    conversions: [
      'PDF ↔ Word',
      'PDF ↔ Excel',
      'PDF ↔ PowerPoint',
      'Office Files ↔ HTML',
      'Office Files ↔ XML',
      'Office Files ↔ OpenDocument'
    ],
    // leave formats empty since selection is handled separately
    formats: [],
    features: [
      'Bidirectional conversions',
      'Support for all popular document formats',
      'Fast, cloud‑based processing',
      'No quality loss'
    ],
    benefits: [
      'Work with any platform or application',
      'Avoid expensive desktop software',
      'Perfect for sharing and archiving',
      'Streamline your workflow'
    ]
  },
];
