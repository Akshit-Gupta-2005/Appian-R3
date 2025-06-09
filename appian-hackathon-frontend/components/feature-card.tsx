import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TextToSpeechButton } from "@/components/text-to-speech-button"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  className?: string
}

export function FeatureCard({ title, description, icon: Icon, className }: FeatureCardProps) {
  return (
    <Card className={cn("border-2 h-full transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold group flex items-center">
          {title}
          <TextToSpeechButton text={title} className="ml-2" showOnHover />
        </CardTitle>
        <Icon className="h-8 w-8 text-primary" />
      </CardHeader>
      <CardContent>
        <CardDescription className="text-spacing text-base group relative">
          {description}
          <TextToSpeechButton text={description} className="absolute top-0 right-0" showOnHover />
        </CardDescription>
      </CardContent>
    </Card>
  )
}

