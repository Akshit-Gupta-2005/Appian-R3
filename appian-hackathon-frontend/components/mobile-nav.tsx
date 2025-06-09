"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import Link from "next/link"
import { TextToSpeechButton } from "@/components/text-to-speech-button"

interface MobileNavProps {
  items: {
    href: string
    label: string
  }[]
}

export function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col gap-4 mt-8">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-lg font-medium transition-colors hover:text-primary py-2 group flex items-center"
              onClick={() => setOpen(false)}
            >
              {item.label}
              <TextToSpeechButton text={item.label} className="ml-2" showOnHover />
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

