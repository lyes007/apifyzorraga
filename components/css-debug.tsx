"use client"

import { useEffect, useState } from 'react'

export function CSSDebug() {
  const [cssLoaded, setCssLoaded] = useState(false)
  const [tailwindWorking, setTailwindWorking] = useState(false)
  const [customCssWorking, setCustomCssWorking] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [cssFiles, setCssFiles] = useState<string[]>([])

  useEffect(() => {
    // Check what CSS files are loaded
    const checkCSSFiles = () => {
      const links = document.querySelectorAll('link[rel="stylesheet"]')
      const cssFiles = Array.from(links).map(link => (link as HTMLLinkElement).href)
      setCssFiles(cssFiles)
      console.log('🔍 CSS Files loaded:', cssFiles)
      
      // Check if the built CSS file is being served
      const hasBuiltCSS = cssFiles.some(file => file.includes('output.css'))
      console.log('🔍 Built CSS file present:', hasBuiltCSS)
      
      // Try to fetch CSS content from the first file to see what's actually being served
      if (cssFiles.length > 0) {
        fetch(cssFiles[0])
          .then(response => response.text())
          .then(text => {
            console.log('🔍 CSS Content preview (first 500 chars):', text.substring(0, 500))
            console.log('🔍 CSS Content length:', text.length)
            console.log('🔍 CSS contains bg-blue-500:', text.includes('bg-blue-500'))
            console.log('🔍 CSS contains test-basic:', text.includes('test-basic'))
          })
          .catch(err => console.log('🔍 Could not fetch CSS content:', err))
      }
    }

    // Check if CSS is loaded
    const checkCSS = () => {
      // Test if Tailwind classes are working
      const testElement = document.createElement('div')
      testElement.className = 'bg-blue-500 text-white p-4 rounded'
      testElement.style.position = 'absolute'
      testElement.style.left = '-9999px'
      testElement.style.top = '-9999px'
      document.body.appendChild(testElement)
      
      const computedStyle = window.getComputedStyle(testElement)
      console.log('🔍 Raw computed styles for Tailwind test:', {
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        padding: computedStyle.padding,
        borderRadius: computedStyle.borderRadius,
        display: computedStyle.display,
        position: computedStyle.position
      })
      
      const hasTailwind = computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                          computedStyle.backgroundColor !== 'transparent' &&
                          computedStyle.backgroundColor !== '' &&
                          computedStyle.backgroundColor !== 'initial'
      
      setTailwindWorking(hasTailwind)
      
      // Test custom CSS rule
      const customElement = document.createElement('div')
      customElement.className = 'test-css-rule'
      customElement.style.position = 'absolute'
      customElement.style.left = '-9999px'
      customElement.style.top = '-9999px'
      document.body.appendChild(customElement)
      
      const customStyle = window.getComputedStyle(customElement)
      console.log('🔍 Raw computed styles for custom CSS test:', {
        backgroundColor: customStyle.backgroundColor,
        color: customStyle.color,
        padding: customStyle.padding,
        borderRadius: customStyle.borderRadius
      })
      
      const hasCustomCss = customStyle.backgroundColor === 'rgb(255, 0, 0)' // red
      
      setCustomCssWorking(hasCustomCss)
      
      // Test basic CSS classes
      const basicElement = document.createElement('div')
      basicElement.className = 'test-basic'
      basicElement.style.position = 'absolute'
      basicElement.style.left = '-9999px'
      basicElement.style.top = '-9999px'
      document.body.appendChild(basicElement)
      
      const basicStyle = window.getComputedStyle(basicElement)
      console.log('🔍 Raw computed styles for basic CSS test:', {
        backgroundColor: basicStyle.backgroundColor,
        color: basicStyle.color,
        padding: basicStyle.padding,
        margin: basicStyle.margin,
        border: basicStyle.border
      })
      
      const hasBasicCss = basicStyle.backgroundColor === 'rgb(255, 0, 0)' // red
      console.log('🔍 Basic CSS working:', hasBasicCss)
      
      // Overall CSS status
      setCssLoaded(hasTailwind || hasCustomCss || hasBasicCss)
      
      // Clean up
      document.body.removeChild(testElement)
      document.body.removeChild(customElement)
      document.body.removeChild(basicElement)
      
      // Store debug info
      setDebugInfo({
        tailwind: {
          backgroundColor: computedStyle.backgroundColor,
          color: computedStyle.color,
          padding: computedStyle.padding,
          borderRadius: computedStyle.borderRadius
        },
        custom: {
          backgroundColor: customStyle.backgroundColor,
          color: customStyle.color,
          padding: customStyle.padding,
          borderRadius: customStyle.borderRadius
        },
        basic: {
          backgroundColor: basicStyle.backgroundColor,
          color: basicStyle.color,
          padding: basicStyle.padding,
          margin: basicStyle.margin,
          border: basicStyle.border
        }
      })
      
      // Log CSS status
      console.log('🔍 CSS Debug Info:')
      console.log('CSS Loaded:', hasTailwind || hasCustomCss || hasBasicCss)
      console.log('Tailwind Working:', hasTailwind)
      console.log('Custom CSS Working:', hasCustomCss)
      console.log('Basic CSS Working:', hasBasicCss)
      console.log('Tailwind Styles:', {
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        padding: computedStyle.padding,
        borderRadius: computedStyle.borderRadius
      })
      console.log('Custom CSS Styles:', {
        backgroundColor: customStyle.backgroundColor,
        color: customStyle.color,
        padding: customStyle.padding,
        borderRadius: customStyle.borderRadius
      })
      console.log('Basic CSS Styles:', {
        backgroundColor: basicStyle.backgroundColor,
        color: basicStyle.color,
        padding: basicStyle.padding,
        margin: basicStyle.margin,
        border: basicStyle.border
      })
      
      // Test inline styles to see if CSS is working at all
      const inlineElement = document.createElement('div')
      inlineElement.style.backgroundColor = 'purple'
      inlineElement.style.color = 'white'
      inlineElement.style.padding = '20px'
      inlineElement.style.position = 'absolute'
      inlineElement.style.left = '-9999px'
      inlineElement.style.top = '-9999px'
      document.body.appendChild(inlineElement)
      
      const inlineStyle = window.getComputedStyle(inlineElement)
      console.log('🔍 Inline styles test:', {
        backgroundColor: inlineStyle.backgroundColor,
        color: inlineStyle.color,
        padding: inlineStyle.padding
      })
      
      document.body.removeChild(inlineElement)
      
      // Test if CSS is working on actual page elements
      const pageElements = document.querySelectorAll('.bg-blue-500, .text-white, .p-4, .rounded')
      if (pageElements.length > 0) {
        const firstElement = pageElements[0]
        const pageElementStyle = window.getComputedStyle(firstElement)
        console.log('🔍 Page element CSS test:', {
          element: firstElement.className,
          backgroundColor: pageElementStyle.backgroundColor,
          color: pageElementStyle.color,
          padding: pageElementStyle.padding,
          borderRadius: pageElementStyle.borderRadius
        })
      } else {
        console.log('🔍 No page elements with CSS classes found')
      }
    }

    // Check CSS files first
    checkCSSFiles()
    
    // Wait a bit for CSS to load
    setTimeout(checkCSS, 1000)
    
    // Check again after 3 seconds
    setTimeout(checkCSS, 3000)
    
    // Check again after 5 seconds
    setTimeout(checkCSS, 5000)
  }, [])

  if (!cssLoaded) {
    return (
      <div className="fixed top-4 right-4 bg-red-500 text-white p-3 rounded text-xs z-50 max-w-xs">
        ⚠️ CSS Not Loaded
        <div className="mt-1 text-xs">
          Tailwind: {tailwindWorking ? '✅' : '❌'}<br/>
          Custom: {customCssWorking ? '✅' : '❌'}<br/>
          Files: {cssFiles.length}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white p-3 rounded text-xs z-50 max-w-xs">
      ✅ CSS Loaded
      <div className="mt-1 text-xs">
        Tailwind: {tailwindWorking ? '✅' : '❌'}<br/>
        Custom: {customCssWorking ? '✅' : '❌'}<br/>
        Files: {cssFiles.length}
      </div>
    </div>
  )
}
