export interface InfoCardData {
  id: string
  title: string
  description: string
  iconType: "guarantee" | "quality" | "shipping" | "certified"
}

export interface InfoCardProps extends InfoCardData {
  className?: string
}

export interface IconProps {
  type: InfoCardData["iconType"]
  className?: string
}
