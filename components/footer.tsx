import React from 'react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center text-sm text-gray-600">
          Designed & Developed with ❤️ by{' '}
          <Link 
            href="https://grindx.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            GrindX Technologies
          </Link>
        </div>
      </div>
    </footer>
  )
}