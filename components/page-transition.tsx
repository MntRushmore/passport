"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface PageTransitionProps {
  children: React.ReactNode
  currentPage: number
}

export function PageTransition({ children, currentPage }: PageTransitionProps) {
  const [displayedPage, setDisplayedPage] = useState(currentPage)

  useEffect(() => {
    setDisplayedPage(currentPage)
  }, [currentPage])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={displayedPage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
