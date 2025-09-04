# Dowry Calculator - Next.js Version 🎭

A satirical website built with Next.js 15 that highlights the absurdity of the dowry system through humor and awareness.

## ⚠️ Important Disclaimer

This project is created purely for educational and satirical purposes to raise awareness about the harmful effects of the dowry system. We strongly oppose the dowry system and believe that every person's worth cannot be measured in monetary terms.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed on your system
- npm, yarn, or pnpm package manager

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the dowry calculator in action!

## 📸 Adding Your Own Funny Images

To add your own funny reaction images:

1. Add your image files to the `public/images/` folder
2. Name them as:
   - `funny1.jpg`
   - `funny2.jpg` 
   - `funny3.jpg`
   - `funny4.jpg`
   - `funny5.jpg`
   - Or add more and update the `funnyImages` array in `app/components/Popup.tsx`

3. Supported formats: JPG, PNG, GIF, SVG
4. Recommended size: 200x200 pixels for best display

## 🏗️ Project Structure

```
dowry/
├── app/
│   ├── components/
│   │   ├── DowryCalculator.tsx    # Main calculator component
│   │   └── Popup.tsx              # Popup component for images
│   ├── globals.css                # Global styles and animations
│   ├── layout.tsx                 # Root layout with metadata
│   └── page.tsx                   # Main page
├── public/
│   └── images/                    # Funny reaction images
│       └── placeholder.svg        # Default placeholder image
├── package.json
└── README-NEXTJS.md               # This file
```

## 🎯 Features

- **Interactive Calculator** - Fill out satirical criteria with React state management
- **Funny Popup System** - Random funny images and messages appear after calculation
- **Educational Message** - Promotes awareness against the dowry system
- **Responsive Design** - Built with Tailwind CSS, works on all devices
- **Easter Eggs** - Hidden surprises (click the title 5 times!)
- **Random Fun Facts** - Educational notifications appear occasionally
- **Smooth Animations** - Custom CSS animations and Tailwind transitions
- **TypeScript Support** - Full type safety throughout the application
- **Next.js 15 Features** - Built with the latest Next.js App Router
- **SEO Optimized** - Proper meta tags and Open Graph support

## 🛠️ Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Custom React components
- **Fonts:** Geist Sans & Geist Mono
- **Build Tool:** Turbopack (enabled)

## 🎨 Customization

### Adding More Images
Edit the `funnyImages` array in `app/components/Popup.tsx`:
```typescript
const funnyImages = [
  '/images/funny1.jpg',
  '/images/funny2.jpg',
  '/images/your_new_image.jpg',
  // Add more here
];
```

### Adding More Messages
Edit the `funnyMessages` array in `app/components/DowryCalculator.tsx`:
```typescript
const funnyMessages = [
  "Your custom funny message here! 😄",
  // Add more here
];
```

### Styling Changes
- Global styles: `app/globals.css`
- Component-specific styles: Use Tailwind classes in components
- Custom animations: Already defined in `globals.css`

## 📱 Responsive Design

The application is fully responsive and works well on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🤝 Contributing

Feel free to contribute by:
- Adding more funny images
- Improving the satirical messages
- Enhancing the UI/UX
- Adding more educational content
- Optimizing performance

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Deploy automatically with zero configuration

### Other Platforms
You can deploy this Next.js app to:
- Netlify
- Heroku
- AWS
- Any hosting platform that supports Node.js

## 📞 Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## 🎭 Remember

This website is meant to be funny while delivering a serious message: **The dowry system is wrong and harmful. Every person has inherent worth that cannot be measured by money or material possessions.**

---

Made with ❤️ for awareness using Next.js | Let's end the dowry system through education and humor!
